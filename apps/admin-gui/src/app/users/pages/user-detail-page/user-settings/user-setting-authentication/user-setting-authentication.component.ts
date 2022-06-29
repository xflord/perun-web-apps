import { Component, OnInit, ViewChild } from '@angular/core';
import { PasswordResetComponent } from '@perun-web-apps/perun/components';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { SetLoginDialogComponent } from '../../../../../shared/components/set-login-dialog/set-login-dialog.component';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-perun-web-apps-user-setting-authentication',
  templateUrl: './user-setting-authentication.component.html',
  styleUrls: ['./user-setting-authentication.component.scss'],
})
export class UserSettingAuthenticationComponent implements OnInit {
  @ViewChild('logins')
  private logins: PasswordResetComponent;
  userId: number;
  filteredNamespaces: string[] = [];

  constructor(private dialog: MatDialog, private entityStorageService: EntityStorageService) {}

  ngOnInit(): void {
    this.userId = this.entityStorageService.getEntity().id;
  }

  onAdd(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      userId: this.userId,
      filteredNamespaces: this.filteredNamespaces,
    };

    const dialogRef = this.dialog.open(SetLoginDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logins.refreshTable();
      }
    });
  }
}
