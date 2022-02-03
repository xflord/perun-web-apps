import { Component, OnInit, Input } from '@angular/core';
import { PreferredLanguageService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-login-screen-base',
  templateUrl: './login-screen-base.component.html',
  styleUrls: ['./login-screen-base.component.scss'],
})
export class LoginScreenBaseComponent implements OnInit {
  constructor(
    private storeService: StoreService,
    private sanitizer: DomSanitizer,
    private preferredLangService: PreferredLanguageService,
    private translateService: TranslateService
  ) {}

  @Input()
  application: string;

  @Input()
  headerTitle: string;

  textColor: string;

  headerBackgroundColor: string;
  headerTextColor: string;
  contentBackgroundColor = this.storeService.get('theme', 'content_bg_color');
  logo: any;

  ngOnInit(): void {
    this.headerBackgroundColor = this.storeService.get('theme', 'nav_bg_color');
    this.headerTextColor = this.storeService.get('theme', 'nav_text_color');
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo'));
    this.textColor = this.headerTitle ? this.storeService.get('theme', 'header_text_color') : '';

    if (this.application === 'user-profile') {
      const prefLang = this.preferredLangService.getPreferredLanguage(null);
      this.translateService.use(prefLang);
    }
  }

  getContentInnerMinHeight() {
    // 64 for nav (+48) when alert is shown
    // 210 for footer, 510 for footer on mobile

    const footerSpace = '0';
    return 'calc((100vh - 64px) + ' + footerSpace + 'px)';
  }
}
