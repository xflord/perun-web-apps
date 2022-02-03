import { Injectable } from '@angular/core';
import { NotificationData } from '@perun-web-apps/perun/models';

@Injectable({
  providedIn: 'root',
})
export class NotificationStorageService {
  constructor() {}

  private notificationData: NotificationData[] = [];

  newNotificationsCount = 0;

  storeNotification(notification: NotificationData) {
    this.newNotificationsCount++;
    this.notificationData.push(notification);
  }

  getNotifications() {
    return this.notificationData.reverse();
  }

  clearNotifications() {
    this.notificationData = [];
  }
}
