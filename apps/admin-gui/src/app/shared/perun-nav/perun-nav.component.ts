import { Component, Input, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';
import {
  NotificationStorageService,
  OtherApplicationsService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { ShowNotificationHistoryDialogComponent } from '../components/dialogs/show-notification-history-dialog/show-notification-history-dialog.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-perun-nav-menu',
  templateUrl: './perun-nav.component.html',
  styleUrls: ['./perun-nav.component.scss'],
})
export class PerunNavComponent implements OnInit {
  @Input()
  sideNav: MatSidenav;
  @Input()
  principal: PerunPrincipal;

  logoutEnabled = true;
  navTextColor = this.store.getProperty('theme').nav_text_color;
  iconColor = this.store.getProperty('theme').nav_icon_color;
  profileLabel: string;
  profileUrl: string;
  logo: SafeHtml;
  isDevel = false;

  constructor(
    private storeService: StoreService,
    private dialog: MatDialog,
    private store: StoreService,
    private sanitizer: DomSanitizer,
    private notificationStorageService: NotificationStorageService,
    private otherApplicationService: OtherApplicationsService
  ) {}

  ngOnInit(): void {
    this.isDevel = this.storeService.getProperty('is_devel');
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.store.getProperty('logo'));
    this.logoutEnabled = this.storeService.getProperty('log_out_enabled');
    this.profileLabel = this.storeService.getProperty('profile_label_en');
    this.profileUrl = this.otherApplicationService.getUrlForOtherApplication('profile');
  }

  showNotificationHistory(): void {
    this.notificationStorageService.newNotificationsCount = 0;

    const config = getDefaultDialogConfig();
    config.width = '520px';

    this.dialog.open(ShowNotificationHistoryDialogComponent, config);
  }

  getNewNotificationsCount(): number {
    return this.notificationStorageService.newNotificationsCount;
  }
}
