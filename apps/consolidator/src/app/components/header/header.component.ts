import { Component } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
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
  logo: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.storeService.getProperty('logo'));

  constructor(private storeService: StoreService, private sanitizer: DomSanitizer) {}
}
