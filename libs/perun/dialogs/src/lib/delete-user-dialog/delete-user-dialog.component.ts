import { Component, Inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { DeleteDialogResult } from '../delete-entity-dialog/delete-entity-dialog.component';

export interface DeleteUserDialogComponentData {
  user: User;
  theme: string;
}

@Component({
  selector: 'perun-web-apps-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html',
  styleUrls: ['./delete-user-dialog.component.scss'],
})
export class DeleteUserDialogComponent implements OnInit {
  theme: string;
  force = false;
  loading: boolean;
  dataSource: MatTableDataSource<User>;
  relations: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<DeleteUserDialogComponentData>,
    @Inject(MAT_DIALOG_DATA) private data: DeleteUserDialogComponentData,
    private notificator: NotificatorService,
    private usersService: UsersManagerService,
    private translate: PerunTranslateService,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<User>([this.data.user]);
    this.relations.push(this.translate.instant('DIALOGS.DELETE_USER.GROUP_RELATION'));
    this.relations.push(this.translate.instant('DIALOGS.DELETE_USER.VO_RELATION'));
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  deleteUser(): void {
    this.loading = true;
    this.usersService.deleteUser(this.data.user.id, this.force).subscribe({
      next: () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.DELETE_USER.SUCCESS_NOTIFICATION'),
        );
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => (this.loading = false),
    });
  }

  onSubmit(result: DeleteDialogResult): void {
    this.force = result.force;
    if (result.deleted) {
      this.deleteUser();
    } else {
      this.onCancel();
    }
  }
}
