import { Component, OnInit } from '@angular/core';
import { PreferredLanguageService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  logo: SafeHtml;

  bgColor = this.storeService.get('theme', 'nav_bg_color') as string;
  textColor = this.storeService.get('theme', 'nav_text_color') as string;
  iconColor = this.storeService.get('theme', 'nav_icon_color') as string;
  label = this.storeService.get(
    `header_label_${this.preferredLangService.getPreferredLanguage(null)}`
  ) as string;
  isDevel = this.storeService.get('is_devel') as string;

  constructor(
    private storeService: StoreService,
    private sanitizer: DomSanitizer,
    private preferredLangService: PreferredLanguageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe((lang) => {
      this.label = this.storeService.get(`header_label_${lang.lang}`) as string;
    });
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo') as string);
  }

  changeLanguage(): void {
    const newLang = this.translateService.currentLang === 'en' ? 'cs' : 'en';
    this.translateService.use(newLang);
  }
}
