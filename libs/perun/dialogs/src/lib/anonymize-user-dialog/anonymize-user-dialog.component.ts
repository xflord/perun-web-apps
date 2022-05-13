import { Component, Inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogResult } from '../delete-entity-dialog/delete-entity-dialog.component';

export interface AnonymizeUserDialogComponentData {
  user: User;
  theme: string;
}

@Component({
  selector: 'perun-web-apps-anonymize-user-dialog',
  templateUrl: './anonymize-user-dialog.component.html',
  styleUrls: ['./anonymize-user-dialog.component.scss'],
})
export class AnonymizeUserDialogComponent implements OnInit {
  theme: string;
  force = false;
  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<User>;
  relations: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AnonymizeUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AnonymizeUserDialogComponentData,
    private notificator: NotificatorService,
    private usersService: UsersManagerService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<User>([this.data.user]);
    this.relations.push(this.translate.instant('DIALOGS.ANONYMIZE_USER.GROUP_RELATION') as string);
    this.relations.push(this.translate.instant('DIALOGS.ANONYMIZE_USER.VO_RELATION') as string);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  anonymizeUser(): void {
    this.loading = true;
    this.usersService.anonymizeUser(this.data.user.id, this.force).subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.ANONYMIZE_USER.SUCCESS_NOTIFICATION') as string
        );
        this.loading = false;
        this.dialogRef.close(true);
      },
      () => (this.loading = false)
    );
  }

  onSubmit(result: DeleteDialogResult): void {
    this.force = result.force;
    if (result.deleted) {
      this.anonymizeUser();
    } else {
      this.onCancel();
    }
  }
}
