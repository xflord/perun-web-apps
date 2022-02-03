import { Component, OnInit } from '@angular/core';
import { NotificationStorageService } from '@perun-web-apps/perun/services';
import { NotificationData } from '@perun-web-apps/perun/models';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-show-notification-history-dialog',
  templateUrl: './show-notification-history-dialog.component.html',
  styleUrls: ['./show-notification-history-dialog.component.scss'],
})
export class ShowNotificationHistoryDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<ShowNotificationHistoryDialogComponent>,
    notificationStorageService: NotificationStorageService
  ) {
    this.notificationStorageService = notificationStorageService;
  }

  notificationStorageService: NotificationStorageService;
  notifications: NotificationData[];

  ngOnInit() {
    this.notifications = this.notificationStorageService.getNotifications();
  }

  onCancel() {
    this.dialogRef.close();
  }

  onClear() {
    this.notificationStorageService.clearNotifications();
    this.notifications = [];
  }
}
