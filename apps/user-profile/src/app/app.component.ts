import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { InitAuthService, StoreService, PreferredLanguageService } from '@perun-web-apps/perun/services';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public static minWidth = 992;
  sidebarMode: 'over' | 'push' | 'side' = 'side';

  constructor(private store:StoreService,
              private attributesManagerService: AttributesManagerService,
              private translateService:TranslateService,
              private initAuth: InitAuthService,
              private changeDetector: ChangeDetectorRef,
              private preferredLangService: PreferredLanguageService) {
    this.getScreenSize();
  }

  sideMenuBgColor = this.store.get('theme', 'sidemenu_bg_color');
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');
  isLoginScreenShown: boolean;
  contentHeight =  'calc(100vh - 84px)';
  headerLabel = this.store.get('header_label_en');

  ngOnInit(): void {
    this.isLoginScreenShown = this.initAuth.isLoginScreenShown();
    if (this.isLoginScreenShown) {
      this.headerLabel = this.store.get(`header_label_${this.preferredLangService.getPreferredLanguage(null)}`);
      return;
    }
    this.attributesManagerService.getUserAttributes(this.store.getPerunPrincipal().userId).subscribe(atts =>{
      const userPrefLang = atts.find(elem => elem.friendlyName === 'preferredLanguage');
      const userLang = userPrefLang && userPrefLang.value ? userPrefLang.value.toString() : null;

      const prefLang = this.preferredLangService.getPreferredLanguage(userLang);
      this.translateService.use(prefLang);
    });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.sidebarMode = this.isMobile() ? 'over' : 'side';
  }

  isMobile(): boolean {
    return window.innerWidth <= AppComponent.minWidth;
  }

  setContentHeight(height: number) {
    this.contentHeight =  'calc(100vh - 84px - '+height+'px)';
    this.changeDetector.detectChanges();
  }
}
