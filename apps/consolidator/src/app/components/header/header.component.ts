import { Component } from '@angular/core';
import { OtherApplicationsService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  bgColor = this.storeService.getProperty('theme').nav_bg_color;
  textColor = this.storeService.getProperty('theme').nav_text_color;
  iconColor = this.storeService.getProperty('theme').nav_icon_color;
  isDevel = this.storeService.getProperty('is_devel');
  logoutEnabled = this.storeService.getProperty('log_out_enabled');
  profileLabel = this.storeService.getProperty('profile_label_en');
  principal = this.storeService.getPerunPrincipal();
  profileUrl = this.otherApplicationService.getUrlForOtherApplication('profile');
  logo: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.storeService.getProperty('logo'));

  constructor(
    private storeService: StoreService,
    private sanitizer: DomSanitizer,
    private otherApplicationService: OtherApplicationsService
  ) {}
}
