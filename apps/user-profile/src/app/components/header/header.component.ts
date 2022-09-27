import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OtherApplicationsService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter();
  @Input() hideToggle = false;
  @Input() disableLogo = false;

  label = this.storeService.getProperty('header_label_en');
  logoutEnabled = this.storeService.getProperty('log_out_enabled');
  adminLabel = this.storeService.getProperty('admin_gui_label_en');
  principal = this.storeService.getPerunPrincipal();

  bgColor = this.storeService.getProperty('theme').nav_bg_color;
  textColor = this.storeService.getProperty('theme').nav_text_color;
  iconColor = this.storeService.getProperty('theme').nav_icon_color;

  isDevel = false;
  logo: SafeHtml;
  adminGuiUrl: string;
  linkRoles: string[];
  activeLink = false;

  constructor(
    private storeService: StoreService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private otherApplicationService: OtherApplicationsService
  ) {}

  ngOnInit(): void {
    this.isDevel = this.storeService.getProperty('is_devel');
    this.translate.onLangChange.subscribe((lang) => {
      this.label = this.storeService.getProperty(
        lang.lang === 'en' ? 'header_label_en' : 'header_label_cs'
      );
      this.adminLabel = this.storeService.getProperty(
        lang.lang === 'en' ? 'admin_gui_label_en' : 'admin_gui_label_cs'
      );
    });
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.getProperty('logo'));

    this.isLinkToGuiActive();
  }

  isLinkToGuiActive(): void {
    this.linkRoles = this.storeService.getProperty('link_to_admin_gui_by_roles');
    for (const roleKey in this.storeService.getPerunPrincipal().roles) {
      if (this.linkRoles.includes(roleKey)) {
        this.activeLink = true;
      }
    }

    if (this.activeLink) {
      this.adminGuiUrl = this.otherApplicationService.getUrlForOtherApplication('admin');
    }
  }

  onToggleSidenav = (): void => {
    this.sidenavToggle.emit();
  };
}
