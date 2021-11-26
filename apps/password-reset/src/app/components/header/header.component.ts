import { Component, OnInit } from '@angular/core';
import { PreferredLanguageService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private storeService: StoreService,
              private sanitizer: DomSanitizer,
              private preferredLangService: PreferredLanguageService,
              private translateService:TranslateService) { }

  logo: any;

  bgColor = this.storeService.get('theme', 'nav_bg_color');
  textColor = this.storeService.get('theme', 'nav_text_color');
  iconColor = this.storeService.get('theme', 'nav_icon_color')
  label = this.storeService.get(`header_label_${this.preferredLangService.getPreferredLanguage(null)}`);
  isDevel = this.storeService.get('is_devel');

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe(lang => {
      this.label = this.storeService.get(`header_label_${lang.lang}`)
    });
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo'));
  }

  changeLanguage() {
    const newLang = this.translateService.currentLang === 'en' ? 'cs' : 'en';
    this.translateService.use(newLang);
  }

}
