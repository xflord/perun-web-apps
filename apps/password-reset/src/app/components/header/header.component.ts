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

  bgColor = this.storeService.getProperty('theme').nav_bg_color;
  textColor = this.storeService.getProperty('theme').nav_text_color;
  iconColor = this.storeService.getProperty('theme').nav_icon_color;
  preferredLanguage = this.preferredLangService.getPreferredLanguage(null);
  label = this.storeService.getProperty(
    this.preferredLanguage === 'en' ? 'header_label_en' : 'header_label_cs'
  );
  isDevel = this.storeService.getProperty('is_devel');

  constructor(
    private storeService: StoreService,
    private sanitizer: DomSanitizer,
    private preferredLangService: PreferredLanguageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe((lang) => {
      this.label =
        lang.lang === 'en'
          ? this.storeService.getProperty('header_label_en')
          : this.storeService.getProperty('header_label_cs');
    });
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.getProperty('logo'));
  }

  changeLanguage(): void {
    const newLang = this.translateService.currentLang === 'en' ? 'cs' : 'en';
    this.translateService.use(newLang);
  }
}
