import { Component, Inject, OnInit } from '@angular/core';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

export interface RemoveUserServiceIdentityDialogData {
  theme: string;
  userId: number;
  specificUser: User;
  isService: boolean;
  targetTitle: 'USER' | 'SELF' | 'SERVICE';
  targetDescription: 'USER' | 'SELF' | 'SERVICE';
}

@Component({
  selector: 'app-disconnect-identity-dialog',
  templateUrl: './disconnect-identity-dialog.component.html',
  styleUrls: ['./disconnect-identity-dialog.component.scss'],
})
export class DisconnectIdentityDialogComponent implements OnInit {
  theme: string;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<User>;
  targetTitle: string;
  targetDescription: string;
  disconnectingLastOwner: boolean;
  disconnectingSelf: boolean;
  private userId: number;
  private isService: boolean;

  constructor(
    private dialogRef: MatDialogRef<DisconnectIdentityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: RemoveUserServiceIdentityDialogData,
    public userManager: UsersManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.targetTitle = this.data.targetTitle;
    this.targetDescription = this.data.targetDescription;
    this.theme = this.data.theme;
    this.userId = Number(this.data.userId);
    this.dataSource = new MatTableDataSource<User>([this.data.specificUser]);
    this.isService = this.data.isService;

    let specificUser: number;
    if (this.isService) {
      specificUser = this.userId;
      this.disconnectingSelf = this.dataSource.data[0].id === this.store.getPerunPrincipal().userId;
    } else {
      specificUser = this.dataSource.data[0].id;
      this.disconnectingSelf = this.userId === this.store.getPerunPrincipal().userId;
    }
    this.userManager.getUsersBySpecificUser(specificUser).subscribe((associatedUsers) => {
      this.disconnectingLastOwner = associatedUsers.length === 1;
    });
  }

  onConfirm(): void {
    let owner: number;
    let specificUser: number;

    if (this.isService) {
      owner = this.dataSource.data[0].id;
      specificUser = this.userId;
    } else {
      owner = this.userId;
      specificUser = this.dataSource.data[0].id;
    }

    this.userManager.removeSpecificUserOwner(owner, specificUser).subscribe(() => {
      this.notificator.showSuccess(
        this.translate.instant('DIALOGS.DISCONNECT_IDENTITY.SUCCESS') as string
      );
      this.dialogRef.close(true);
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
