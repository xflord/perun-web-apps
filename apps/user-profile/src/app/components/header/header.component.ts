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

  label = this.storeService.get('header_label_en') as string;
  logoutEnabled = this.storeService.get('log_out_enabled') as string;
  adminLabel = this.storeService.get('admin_gui_label_en') as string;
  principal = this.storeService.getPerunPrincipal();

  bgColor = this.storeService.get('theme', 'nav_bg_color') as string;
  textColor = this.storeService.get('theme', 'nav_text_color') as string;
  iconColor = this.storeService.get('theme', 'nav_icon_color') as string;

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
    this.isDevel = this.storeService.get('is_devel') as boolean;
    this.translate.onLangChange.subscribe((lang) => {
      this.label = this.storeService.get(`header_label_${lang.lang}`) as string;
      this.adminLabel = this.storeService.get(`admin_gui_label_${lang.lang}`) as string;
    });
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo') as string);

    this.isLinkToGuiActive();
  }

  isLinkToGuiActive(): void {
    this.linkRoles = this.storeService.get('link_to_admin_gui_by_roles') as string[];
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
