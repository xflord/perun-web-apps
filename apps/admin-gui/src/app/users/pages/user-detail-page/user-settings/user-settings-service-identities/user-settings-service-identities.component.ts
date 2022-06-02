import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TABLE_USER_SERVICE_IDENTITIES } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ConnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/connect-identity-dialog/connect-identity-dialog.component';
import { DisconnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/disconnect-identity-dialog/disconnect-identity-dialog.component';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-settings-service-identities',
  templateUrl: './user-settings-service-identities.component.html',
  styleUrls: ['./user-settings-service-identities.component.scss'],
})
export class UserSettingsServiceIdentitiesComponent implements OnInit {
  loading = false;
  selection = new SelectionModel<User>(false, []);
  identities: User[] = [];
  userId: number;
  tableId = TABLE_USER_SERVICE_IDENTITIES;
  displayedColumns = ['select', 'id', 'user', 'name'];
  addIdentity: boolean;
  removeIdentity: boolean;
  routeToAdminSection = true;
  targetTitle = 'SERVICE';
  targetDescription = 'SERVICE';

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private userManager: UsersManagerService,
    public authResolver: GuiAuthResolver,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.parent.params.subscribe((params) => {
      this.userId = Number(params['userId']);
      if (this.userId === undefined) {
        this.targetTitle = 'SERVICE';
        this.targetDescription = 'SELF';
        this.userId = this.store.getPerunPrincipal().userId;
        this.routeToAdminSection = false;
      }
      this.setAuthRights();
      this.refreshTable();
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.userManager.getSpecificUsersByUser(this.userId).subscribe((identities) => {
      this.identities = identities;
      this.selection.clear();
      this.loading = false;
    });
  }

  setAuthRights(): void {
    this.addIdentity = this.authResolver.isPerunAdmin();
    this.removeIdentity = this.authResolver.isAuthorized(
      'removeSpecificUserOwner_User_User_policy',
      [{ id: this.userId, beanName: 'User' }]
    );
  }

  onAdd(): void {
    const config = getDefaultDialogConfig();
    config.width = '1250px';
    config.data = {
      userId: this.userId,
      theme: 'user-theme',
      isService: false,
      target: this.targetTitle,
    };

    const dialogRef = this.dialog.open(ConnectIdentityDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onRemove(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      identities: this.selection.selected,
      userId: this.userId,
      specificUser: this.selection.selected[0],
      theme: 'user-theme',
      targetTitle: this.targetTitle,
      targetDescription: this.targetDescription,
    };

    const dialogRef = this.dialog.open(DisconnectIdentityDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }
}
