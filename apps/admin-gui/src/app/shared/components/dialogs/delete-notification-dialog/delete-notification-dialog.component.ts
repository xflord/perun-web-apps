import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationMail, RegistrarManagerService } from '@perun-web-apps/perun/openapi';

export interface DeleteApplicationFormMailDialogData {
  theme: string;
  voId: number;
  groupId: number;
  mails: ApplicationMail[];
}

@Component({
  selector: 'app-delete-notification-dialog',
  templateUrl: './delete-notification-dialog.component.html',
  styleUrls: ['./delete-notification-dialog.component.scss'],
})
export class DeleteNotificationDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<ApplicationMail>;
  theme: string;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteApplicationFormMailDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private registrarService: RegistrarManagerService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<ApplicationMail>(this.data.mails);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    if (this.data.groupId) {
      for (const mail of this.data.mails) {
        this.registrarService.deleteApplicationMailForGroup(this.data.groupId, mail.id).subscribe(
          () => {
            this.dialogRef.close(true);
          },
          () => (this.loading = false)
        );
      }
    } else {
      for (const mail of this.data.mails) {
        this.registrarService.deleteApplicationMailForVo(this.data.voId, mail.id).subscribe(
          () => {
            this.dialogRef.close(true);
          },
          () => (this.loading = false)
        );
      }
    }
  }

  getMailType(applicationMail: ApplicationMail): string {
    let value = '';
    if (
      applicationMail.mailType === undefined ||
      applicationMail.mailType === null ||
      applicationMail.mailType.length === 0
    ) {
      value = '';
    } else {
      this.translate
        .get('VO_DETAIL.SETTINGS.NOTIFICATIONS.MAIL_TYPE_' + applicationMail.mailType)
        .subscribe((text: string) => {
          value = text;
        });
    }
    return value;
  }
}
