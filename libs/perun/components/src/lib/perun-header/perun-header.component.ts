import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  NotificationStorageService,
  OtherApplicationsService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { ShowNotificationHistoryDialogComponent } from '@perun-web-apps/perun/dialogs';
import { AppType } from '@perun-web-apps/perun/models';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './perun-header.component.html',
  styleUrls: ['./perun-header.component.scss'],
})
export class PerunHeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter();
  @Input() showToggle = true;
  @Input() showLanguageMenu = false;
  @Input() showHeaderMenu = true;
  @Input() showNotifications = false;
  @Input() disableLogo = false;
  @Input() otherApp: AppType;

  label = this.storeService.getProperty('header_label_en');
  logoutEnabled = this.storeService.getProperty('log_out_enabled');
  principal = this.storeService.getPerunPrincipal();

  bgColor = this.storeService.getProperty('theme').nav_bg_color;
  textColor = this.storeService.getProperty('theme').nav_text_color;
  iconColor = this.storeService.getProperty('theme').nav_icon_color;
  navTextColor = this.storeService.getProperty('theme').nav_text_color;

  logo: SafeHtml;

  otherAppLabel: string;
  otherAppUrl: string;
  linkRoles: string[];
  activeLink = false;

  constructor(
    private storeService: StoreService,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private otherApplicationService: OtherApplicationsService,
    private notificationStorageService: NotificationStorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.otherAppLabel = this.getOtherAppLabel();

    this.translateService.onLangChange.subscribe((lang) => {
      this.label = this.storeService.getProperty(
        lang.lang === 'en' ? 'header_label_en' : 'header_label_cs'
      );
      this.otherAppLabel = this.getOtherAppLabel(lang.lang);
    });

    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.getProperty('logo'));

    this.isLinkToOtherAppActive();
  }

  getOtherAppLabel(currLang = 'en'): string {
    if (this.otherApp === AppType.Profile) {
      return this.storeService.getProperty('profile_label_en');
    }
    return this.storeService.getProperty(
      currLang === 'en' ? 'admin_gui_label_en' : 'admin_gui_label_cs'
    );
  }

  isLinkToOtherAppActive(): void {
    if (this.otherApp === AppType.Admin) {
      this.linkRoles = this.storeService.getProperty('link_to_admin_gui_by_roles');

      for (const roleKey in this.storeService.getPerunPrincipal().roles) {
        if (this.linkRoles.includes(roleKey)) {
          this.activeLink = true;
        }
      }
    }

    if (this.otherApp !== AppType.Admin || this.activeLink) {
      this.otherAppUrl = this.otherApplicationService.getUrlForOtherApplication(this.otherApp);
    }
  }

  onToggleSidenav = (): void => {
    this.sidenavToggle.emit();
  };

  changeLanguage(): void {
    const newLang = this.translateService.currentLang === 'en' ? 'cs' : 'en';
    this.translateService.use(newLang);
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
