import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthzResolverService, UtilsService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  label = this.storeService.get('header_label_en');
  logoutEnabled = this.storeService.get('log_out_enabled');
  adminLabel = this.storeService.get('admin_gui_label_en');
  principal = this.storeService.getPerunPrincipal();

  @Output()
  sidenavToggle = new EventEmitter();

  @Input()
  hideToggle = false;

  @Input()
  disableLogo = false;

  bgColor = this.storeService.get('theme', 'nav_bg_color');
  textColor = this.storeService.get('theme', 'nav_text_color');
  iconColor = this.storeService.get('theme', 'nav_icon_color');

  constructor( private storeService: StoreService,
               private sanitizer: DomSanitizer,
               private translate: TranslateService,
               private utilsService: UtilsService,
               private authzResolverService: AuthzResolverService,
               private authService: AuthService,) { }
  logo: any;
  adminGuiUrl: string;
  linkRoles: string[];
  activeLink = false;

  ngOnInit() {
    this.translate.onLangChange.subscribe(lang => {
      this.label = this.storeService.get(`header_label_${lang.lang}`)
      this.adminLabel = this.storeService.get(`admin_gui_label_${lang.lang}`);
    })
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo'));

    this.isLinkToGuiActive();
  }

  isLinkToGuiActive() {
    this.linkRoles = this.storeService.get('link_to_admin_gui_by_roles');
    for (const roleKey in this.storeService.getPerunPrincipal().roles) {
      if (this.linkRoles.includes(roleKey)) {
        this.activeLink = true;
      }
    }

    if (this.activeLink) {
      this.utilsService.getAppsConfig().subscribe(config => {
        this.adminGuiUrl = !!config.brands[0].newApps.admin ? config.brands[0].newApps.admin : null;
      });
    }
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
