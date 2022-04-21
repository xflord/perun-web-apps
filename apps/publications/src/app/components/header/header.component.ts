import { Component, Input, OnInit } from '@angular/core';
import { AuthService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatSidenav } from '@angular/material/sidenav';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() sideNav: MatSidenav;
  principal: PerunPrincipal;
  bgColor = this.storeService.get('theme', 'nav_bg_color') as string;
  textColor = this.storeService.get('theme', 'nav_text_color') as string;
  iconColor = this.storeService.get('theme', 'nav_icon_color') as string;
  isDevel = false;
  logo: SafeHtml;

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isDevel = this.storeService.get('is_devel') as boolean;
    this.principal = this.storeService.getPerunPrincipal();
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo') as string);
  }

  onLogOut(): void {
    this.authService.logout();
  }
}
