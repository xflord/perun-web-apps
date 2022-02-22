import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationData } from '@perun-web-apps/perun/models';
import { MatDialog } from '@angular/material/dialog';

import { NotificationStorageService } from '@perun-web-apps/perun/services';
import { doAfterDelay, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { NotificationDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'perun-web-apps-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  @Input() data: NotificationData;
  @Input() inDialog: boolean;
  @Input() newNotification = false;
  @Output() closeNotification: EventEmitter<NotificationData> =
    new EventEmitter<NotificationData>();

  alreadyPressed = false;
  alreadyClosed = false;
  waiting = false;

  constructor(
    private dialog: MatDialog,
    private notificationStorageService: NotificationStorageService
  ) {}

  doAction(): void {
    if (this.newNotification) {
      this.alreadyPressed = true;
    }
    if (this.notificationStorageService.newNotificationsCount) {
      this.notificationStorageService.newNotificationsCount--;
    }
    if (this.data.action !== undefined) {
      this.data.action();
    } else {
      const config = getDefaultDialogConfig();
      config.width = '550px';
      config.data = this.data;
      config.autoFocus = false;

      const dialogRef = this.dialog.open(NotificationDialogComponent, config);

      dialogRef.afterClosed().subscribe(() => {
        this.closeSelf();
      });
    }
  }

  closeSelf(): void {
    if (!this.inDialog) {
      if (this.newNotification) {
        this.alreadyClosed = true;
      }
      if (this.notificationStorageService.newNotificationsCount) {
        this.notificationStorageService.newNotificationsCount--;
      }
      this.closeNotification.emit();
    }
  }

  ngOnInit(): void {
    void doAfterDelay(this.data.delay, () => {
      if (!this.alreadyClosed && !this.waiting) {
        this.closeSelf();
      }
    });
  }

  showTimestamp(): string {
    const [hours, minutes] = this.data.timeStamp.split(':');

    if (minutes.length < 2) {
      return hours + ':0' + minutes;
    }

    return this.data.timeStamp;
  }
}
