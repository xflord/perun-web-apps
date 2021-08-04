import { Component, Inject, OnInit } from '@angular/core';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

export interface RemoveUserServiceIdentityDialogData {
  theme: string;
  userId: number;
  specificUser: User;
  isService: boolean;
}

@Component({
  selector: 'app-disconnect-identity-dialog',
  templateUrl: './disconnect-identity-dialog.component.html',
  styleUrls: ['./disconnect-identity-dialog.component.scss']
})
export class DisconnectIdentityDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DisconnectIdentityDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: RemoveUserServiceIdentityDialogData,
              public userManager: UsersManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService) {

  }

  theme: string;
  userId: number;
  isService: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<User>;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.userId = this.data.userId;
    this.dataSource = new MatTableDataSource<User>([this.data.specificUser]);
    this.isService = this.data.isService;
  }

  onConfirm(){
    let owner: number;
    let specificUser: number;

    if(this.isService) {
      owner = this.dataSource.data[0].id;
      specificUser = this.userId;
    } else {
      owner = this.userId;
      specificUser = this.dataSource.data[0].id;
    }

    this.userManager.removeSpecificUserOwner(owner, specificUser).subscribe(() => {
      this.notificator.showSuccess(this.translate.instant('DIALOGS.DISCONNECT_IDENTITY.SUCCESS'));
      this.dialogRef.close(true);
    });

  }

  onCancel(){
    this.dialogRef.close(false);
  }

}
