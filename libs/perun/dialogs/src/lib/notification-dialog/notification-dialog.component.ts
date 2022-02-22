import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationData } from '@perun-web-apps/perun/models';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { BugReportDialogComponent } from '../bug-report-dialog/bug-report-dialog.component';

@Component({
  selector: 'perun-web-apps-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss'],
})
export class NotificationDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<NotificationDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: NotificationData
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onBugReportClick(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      const config = getDefaultDialogConfig();
      config.width = '550px';
      config.data = { error: this.data.error };
      config.autoFocus = false;

      this.dialog.open(BugReportDialogComponent, config);
    });
    this.dialogRef.close();
  }
}
