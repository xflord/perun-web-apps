import { Component, Input, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthzResolverService, PerunPrincipal } from '@perun-web-apps/perun/openapi';
import {
  AuthService,
  NotificationStorageService,
  NotificatorService,
  OtherApplicationsService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { ShowNotificationHistoryDialogComponent } from '../components/dialogs/show-notification-history-dialog/show-notification-history-dialog.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
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
  navTextColor = this.store.get('theme', 'nav_text_color') as string;
  iconColor = this.store.get('theme', 'nav_icon_color') as string;
  profileLabel: string;
  profileUrl: string;
  logo: SafeHtml;
  isDevel = false;

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    public authzResolverService: AuthzResolverService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translateService: TranslateService,
    private store: StoreService,
    private sanitizer: DomSanitizer,
    private notificationStorageService: NotificationStorageService,
    private otherApplicationService: OtherApplicationsService
  ) {}

  ngOnInit(): void {
    this.isDevel = this.storeService.get('is_devel') as boolean;
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.store.get('logo') as string);
    this.logoutEnabled = this.storeService.get('log_out_enabled') as boolean;
    this.profileLabel = this.storeService.get('profile_label_en') as string;
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
