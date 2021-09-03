import { Component, OnInit } from '@angular/core';
import { Attribute, AttributesManagerService} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ChangePasswordDialogComponent } from '../../../../dialogs/src/lib/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'perun-web-apps-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  userId: number;

  nameSpaces: string[] = [];
  logins: Attribute[] = [];

  displayedColumns: string[] = ['namespace', 'value', 'reset', 'change'];
  dataSource: MatTableDataSource<Attribute>;

  constructor(private attributesManagerService: AttributesManagerService,
              private store: StoreService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.userId = this.store.getPerunPrincipal().userId;
    this.nameSpaces = this.store.get('password_namespace_attributes');
    this.attributesManagerService.getLogins(this.userId).subscribe(logins => {
      const parsedNamespaces = this.nameSpaces.map(nameSpace => {
        const elems = nameSpace.split(':');
        return elems[elems.length - 1];
      });

      this.logins = logins.filter(login => parsedNamespaces.includes(login.friendlyNameParameter));
      this.dataSource = new MatTableDataSource<Attribute>(logins);
    });
  }

  resetPassword(login: string) {
    const url = this.store.get('pwd_reset_base_url');
    location.href = `${url}?login-namespace=${login}`;
  }

  changePassword(login){
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      login: login.value,
      namespace: login.friendlyName.split(':')[1]
    };

   this.dialog.open(ChangePasswordDialogComponent, config);
  }
}
