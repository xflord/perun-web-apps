/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-call*/
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { RPCError } from '@perun-web-apps/perun/models';
import { RTMessagesManagerService } from '@perun-web-apps/perun/openapi';
declare let require: any;

export interface BugReportData {
  error: RPCError;
}

@Component({
  selector: 'perun-web-apps-bug-report-dialog',
  templateUrl: './bug-report-dialog.component.html',
  styleUrls: ['./bug-report-dialog.component.scss'],
})
export class BugReportDialogComponent implements OnInit {
  message = '';
  subject = '';
  methodRegexp = /(\w+\/\w+)$/g;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<BugReportDialogComponent>,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private rtMessages: RTMessagesManagerService,
    @Inject(MAT_DIALOG_DATA) public data: BugReportData,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    if (this.data?.error?.errorId) {
      this.subject = ''.concat(
        this.translate.instant('SHARED_LIB.PERUN.COMPONENTS.BUG_REPORT.SUBJECT_VALUE') as string,
        this.parseMethod(this.data.error.call),
        ' (',
        this.data.error.errorId,
        ')'
      );
    }
  }

  sendBugReport(): void {
    this.loading = true;
    this.rtMessages
      .sentMessageToRTWithQueue('perun', this.subject, this.getFullEmailBody())
      .subscribe(
        (rtMessage) => {
          this.dialogRef.afterClosed().subscribe(() => {
            const msg: string = ''.concat(
              this.translate.instant('SHARED_LIB.PERUN.COMPONENTS.BUG_REPORT.SUCCESS1') as string,
              rtMessage.ticketNumber.toString(),
              this.translate.instant('SHARED_LIB.PERUN.COMPONENTS.BUG_REPORT.SUCCESS2') as string
            );
            this.notificator.showSuccess(msg);
          });
          this.dialogRef.close();
        },
        () => {
          this.loading = false;
          this.dialogRef.afterClosed().subscribe(() => {
            //TODO WHEN REPORT BUG FAIL
          });
        }
      );
  }

  getFullEmailBody(): string {
    const instance: string = this.storeService.get('config') as string;
    let text =
      this.message +
      '\n' +
      '------------------------\n' +
      'Technical details:\n\n' +
      this.data.error.errorId;

    if (this.data.error.type) {
      text = text.concat(' ' + this.data.error.type + '\n');
    } else {
      text = text.concat('\n');
    }

    text = text.concat(
      this.data.error.message,
      '\n',
      'Perun instance: ',
      instance,
      '\n',
      'Request:\n',
      this.data.error.urlWithParams,
      '\n\n'
    );

    if (this.data.error.payload) {
      const re = /"password":".+?"/;
      let payload = JSON.stringify(this.data.error.payload);
      payload = payload.replace(re, '"password":"####"');
      text = text.concat('Payload:\n' + payload + '\n\n');
    }

    text = text.concat(
      'Sent from new Perun Gui, version: ',
      require('../../../../../../package.json').version as string
    );
    return text.split('\n').join('\n '); //add space after each new line
  }

  private parseMethod(url: string): string {
    if (!url) {
      return url;
    }
    return this.methodRegexp.exec(url)[1];
  }
}
