import { Injectable } from '@angular/core';
import { NotificationData } from '@perun-web-apps/perun/models';

@Injectable({
  providedIn: 'root',
})
export class NotificationStorageService {
  newNotificationsCount = 0;
  private notificationData: NotificationData[] = [];

  storeNotification(notification: NotificationData): void {
    this.newNotificationsCount++;
    this.notificationData.push(notification);
  }

  getNotifications(): NotificationData[] {
    return this.notificationData.reverse();
  }

  clearNotifications(): void {
    this.notificationData = [];
  }
}
