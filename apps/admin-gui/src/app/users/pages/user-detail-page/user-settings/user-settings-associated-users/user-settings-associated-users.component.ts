import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  TABLE_USER_ASSOCIATED_USERS
} from '@perun-web-apps/config/table-config';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ConnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/connect-identity-dialog/connect-identity-dialog.component';
import { DisconnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/disconnect-identity-dialog/disconnect-identity-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-settings-associated-users',
  templateUrl: './user-settings-associated-users.component.html',
  styleUrls: ['./user-settings-associated-users.component.scss']
})
export class UserSettingsAssociatedUsersComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private dialog: MatDialog,
              private router: Router,
              public authResolver: GuiAuthResolver,
              private userManager: UsersManagerService) {
  }

  loading = false;
  selection = new SelectionModel<User>(false, []);
  associatedUsers: User[] = [];
  userId: number;
  tableId = TABLE_USER_ASSOCIATED_USERS;
  displayedColumns = [ 'select', 'id', 'user', 'name' ];
  addAuth: boolean;
  removeAuth: boolean;
  disableRouting: boolean;

  ngOnInit(): void {
    this.loading = true;

    this.route.parent.params
      .subscribe(params => {
        this.userId = params["userId"];
        this.userManager.getUsersBySpecificUser(this.userId).subscribe(associatedUsers => {
          this.associatedUsers = associatedUsers;
          this.setAuth();
          this.loading = false;
        });
      });
  }

  refreshTable(){
    this.loading = true;
    this.userManager.getUsersBySpecificUser(this.userId).subscribe(associatedUsers => {
      this.associatedUsers = associatedUsers;
      this.selection.clear();
      this.loading = false;
    });
  }

  setAuth() {
    this.addAuth = this.authResolver.isAuthorized('addSpecificUserOwner_User_User_policy', [{id: this.userId, beanName: 'User'}]);
    this.removeAuth = this.authResolver.isAuthorized('removeSpecificUserOwner_User_User_policy', [{id: this.userId, beanName: 'User'}]);
    this.disableRouting = !this.authResolver.isPerunAdminOrObserver();
  }

  onAdd(){
    const config = getDefaultDialogConfig();
    config.width = "1250px";
    config.data = {
      userId : this.userId,
      theme: "user-theme",
      isService: true,
      target: 'USER'
    };

    const dialogRef = this.dialog.open(ConnectIdentityDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onRemove(){
    const config = getDefaultDialogConfig();
    config.width = "650px";
    config.data = {
      identities: this.selection.selected,
      userId: this.userId,
      specificUser: this.selection.selected[0],
      isService: true,
      theme: "user-theme",
      targetTitle: 'USER',
      targetDescription: 'SERVICE'
    };

    const dialogRef = this.dialog.open(DisconnectIdentityDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if(!this.authResolver.isAuthorized('getUsersBySpecificUser_User_policy', [{id: this.userId, beanName: 'User'}])) {
          this.router.navigate(['/myProfile']);
        } else {
          this.refreshTable();
        }
      }
    });
  }
}
