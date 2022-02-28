import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TABLE_USER_ASSOCIATED_USERS } from '@perun-web-apps/config/table-config';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ConnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/connect-identity-dialog/connect-identity-dialog.component';
import { DisconnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/disconnect-identity-dialog/disconnect-identity-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-settings-associated-users',
  templateUrl: './user-settings-associated-users.component.html',
  styleUrls: ['./user-settings-associated-users.component.scss'],
})
export class UserSettingsAssociatedUsersComponent implements OnInit {
  loading = false;
  selection = new SelectionModel<User>(false, []);
  associatedUsers: User[] = [];
  user: User;
  tableId = TABLE_USER_ASSOCIATED_USERS;
  displayedColumns = ['select', 'id', 'user', 'name'];
  addAuth: boolean;
  removeAuth: boolean;
  disableRouting: boolean;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    public authResolver: GuiAuthResolver,
    private userManager: UsersManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.user = this.entityStorageService.getEntity();
    this.userManager.getUsersBySpecificUser(this.user.id).subscribe((associatedUsers) => {
      this.associatedUsers = associatedUsers;
      this.setAuth();
      this.loading = false;
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.userManager.getUsersBySpecificUser(this.user.id).subscribe((associatedUsers) => {
      this.associatedUsers = associatedUsers;
      this.selection.clear();
      this.loading = false;
    });
  }

  setAuth(): void {
    this.addAuth = this.authResolver.isAuthorized('addSpecificUserOwner_User_User_policy', [
      this.user,
    ]);
    this.removeAuth = this.authResolver.isAuthorized('removeSpecificUserOwner_User_User_policy', [
      this.user,
    ]);
    this.disableRouting = !this.authResolver.isPerunAdminOrObserver();
  }

  onAdd(): void {
    const config = getDefaultDialogConfig();
    config.width = '1250px';
    config.data = {
      userId: this.user.id,
      theme: 'user-theme',
      isService: true,
      target: 'USER',
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
      userId: this.user.id,
      specificUser: this.selection.selected[0],
      isService: true,
      theme: 'user-theme',
      targetTitle: 'USER',
      targetDescription: 'SERVICE',
    };

    const dialogRef = this.dialog.open(DisconnectIdentityDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (!this.authResolver.isAuthorized('getUsersBySpecificUser_User_policy', [this.user])) {
          void this.router.navigate(['/myProfile']);
        } else {
          this.refreshTable();
        }
      }
    });
  }
}
