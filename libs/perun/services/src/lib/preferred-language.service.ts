import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class PreferredLanguageService {

  constructor(private route: ActivatedRoute,
              private store: StoreService) { }


  getPreferredLanguage(userLang: string): string {
    const supportedLang = this.store.get('supported_languages');
    const browserLang = navigator.languages.map(lang => lang.split('-')[0]);

    const query = location.search.substr(1).split('&');
    let urlLang = null;
    for(const param of query) {
      const p = param.split('=');
      if(p[0] === 'lang') {
        urlLang = p[1];
      }
    }

    // language set in url has highest priority
    if (urlLang && supportedLang.includes(urlLang)) {
      return urlLang;
    }

    // than user preferred language
    if (userLang && supportedLang.includes(userLang)) {
      return userLang;
    }

    // lastly browser language
    if (browserLang && supportedLang.includes(browserLang[0])) {
      return browserLang[0];
    }

    // default language
    return 'en';
  }
}
