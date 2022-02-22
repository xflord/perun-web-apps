/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-call */
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { RTMessagesManagerService } from '@perun-web-apps/perun/openapi';
declare let require: any;

@Component({
  selector: 'perun-web-apps-report-issue-dialog',
  templateUrl: './report-issue-dialog.component.html',
  styleUrls: ['./report-issue-dialog.component.scss'],
})
export class ReportIssueDialogComponent implements OnInit {
  message = '';
  subject = '';
  private instanceName = '';

  constructor(
    private dialogRef: MatDialogRef<ReportIssueDialogComponent>,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private rtMessages: RTMessagesManagerService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.instanceName = this.storeService.get('config') as string;
  }

  sendBugReport(): void {
    this.rtMessages
      .sentMessageToRTWithQueue('perun', this.subject, this.getFullEmailBody())
      .subscribe((message) => {
        this.dialogRef
          .afterClosed()
          .subscribe(() =>
            this.notificator.showSuccess(
              (this.translate.instant('DIALOGS.REPORT_ISSUE.SUCCESS') as string) +
                String(message.ticketNumber)
            )
          );
        this.dialogRef.close();
      });
  }

  getFullEmailBody(): string {
    return this.message.concat(
      '\n ',
      '------------------------\n ',
      'Perun instance: ',
      this.instanceName,
      '\n ',
      'Sended from new Perun Gui, version: ',
      require('../../../../../../package.json').version as string
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
