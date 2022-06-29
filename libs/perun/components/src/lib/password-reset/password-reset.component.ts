import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import {
  EntityStorageService,
  OtherApplicationsService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ChangePasswordDialogComponent } from '@perun-web-apps/perun/dialogs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {
  @Input() authenticationPage = false;
  @Output() filteredNamespaces: EventEmitter<string[]> = new EventEmitter<string[]>();
  logins: Attribute[] = [];
  displayedColumns: string[];
  dataSource: MatTableDataSource<Attribute>;
  private nameSpaces: string[] = [];
  private userId: number;

  constructor(
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private otherApplicationService: OtherApplicationsService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.userId = this.authenticationPage
      ? this.entityStorageService.getEntity().id
      : this.store.getPerunPrincipal().userId;
    this.displayedColumns = this.authenticationPage
      ? ['namespace', 'value', 'change']
      : ['namespace', 'value', 'reset', 'change'];
    this.nameSpaces = (this.store.get('password_namespace_attributes') as string[]).map(
      (urn: string) => {
        const urns: string[] = urn.split(':');
        return urns[urns.length - 1];
      }
    );
    this.refreshTable();
  }

  refreshTable(): void {
    this.attributesManagerService.getLogins(this.userId).subscribe((logins) => {
      this.logins = logins.filter((login) => this.nameSpaces.includes(login.friendlyNameParameter));
      this.filteredNamespaces.emit(logins.map((login) => login.friendlyNameParameter));
      this.dataSource = new MatTableDataSource<Attribute>(logins);

      if (!this.authenticationPage) {
        const params = this.route.snapshot.queryParamMap;
        const namespace = params.get('namespace');
        if (namespace) {
          const login = this.logins.find((a) => a.friendlyNameParameter === namespace);
          if (login) {
            this.changePassword(login);
          }
        }
      }
    });
  }

  resetPassword(login: string): void {
    window.open(
      this.otherApplicationService.getUrlForOtherApplication('pwdReset', login),
      '_blank'
    );
  }

  changePassword(login: Attribute): void {
    if (!this.authenticationPage) {
      void this.router.navigate([], {
        queryParams: {
          namespace: login.friendlyNameParameter,
        },
        queryParamsHandling: 'merge',
      });
    }

    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      login: String(login.value),
      namespace: login.friendlyName.split(':')[1],
    };

    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, config);

    dialogRef.afterClosed().subscribe(() => {
      void this.router.navigate([], {
        queryParams: {
          namespace: null,
        },
        queryParamsHandling: 'merge',
      });
    });
  }
}
