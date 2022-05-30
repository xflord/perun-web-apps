import { Component, OnInit } from '@angular/core';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { OtherApplicationsService, StoreService } from '@perun-web-apps/perun/services';
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
  logins: Attribute[] = [];
  displayedColumns: string[] = ['namespace', 'value', 'reset', 'change'];
  dataSource: MatTableDataSource<Attribute>;
  private nameSpaces: string[] = [];
  private userId: number;

  constructor(
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private otherApplicationService: OtherApplicationsService
  ) {}

  ngOnInit(): void {
    this.userId = this.store.getPerunPrincipal().userId;
    this.nameSpaces = this.store.get('password_namespace_attributes') as string[];
    this.attributesManagerService.getLogins(this.userId).subscribe((logins) => {
      const parsedNamespaces = this.nameSpaces.map((nameSpace) => {
        const elems = nameSpace.split(':');
        return elems[elems.length - 1];
      });

      this.logins = logins.filter((login) =>
        parsedNamespaces.includes(login.friendlyNameParameter)
      );
      this.dataSource = new MatTableDataSource<Attribute>(logins);

      const params = this.route.snapshot.queryParamMap;
      const namespace = params.get('namespace');
      if (namespace) {
        const login = this.logins.find((a) => a.friendlyNameParameter === namespace);
        if (login) {
          this.changePassword(login);
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
    void this.router.navigate([], {
      queryParams: {
        namespace: login.friendlyNameParameter,
      },
      queryParamsHandling: 'merge',
    });

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
