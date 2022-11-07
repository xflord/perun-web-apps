import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  InitAuthService,
  StoreService,
  PreferredLanguageService,
} from '@perun-web-apps/perun/services';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { AppType } from '@perun-web-apps/perun/models';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  static minWidth = 992;
  @ViewChild('footer') footer: ElementRef<HTMLDivElement>;
  sidebarMode: 'over' | 'push' | 'side' = 'side';
  sideMenuBgColor = this.store.getProperty('theme').sidemenu_bg_color;
  contentBackgroundColor = this.store.getProperty('theme').content_bg_color;
  isLoginScreenShown: boolean;
  isServiceAccess: boolean;
  contentHeight = 'calc(100vh - 84px)';
  headerLabel = this.store.getProperty('header_label_en');
  otherApp = AppType.Admin;

  constructor(
    private store: StoreService,
    private attributesManagerService: AttributesManagerService,
    private translateService: TranslateService,
    private initAuth: InitAuthService,
    private changeDetector: ChangeDetectorRef,
    private preferredLangService: PreferredLanguageService,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(): void {
    this.sidebarMode = this.isMobile() ? 'over' : 'side';
  }

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe((langChange: LangChangeEvent) => {
      const documentTitle = this.store.getProperty('document_title');
      const title: string = langChange.lang === 'en' ? documentTitle.en : documentTitle.cs;
      this.titleService.setTitle(title);
      this.document.documentElement.lang = langChange.lang;
    });

    this.isLoginScreenShown = this.initAuth.isLoginScreenShown();
    this.isServiceAccess = this.initAuth.isServiceAccessLoginScreenShown();
    sessionStorage.removeItem('baLogout');
    if (this.isLoginScreenShown) {
      const preferredLanguage = this.preferredLangService.getPreferredLanguage(null);
      this.headerLabel = this.store.getProperty(
        preferredLanguage === 'en' ? 'header_label_en' : 'header_label_cs'
      );
      return;
    }
    if (this.isServiceAccess) {
      return;
    }
    this.attributesManagerService
      .getUserAttributes(this.store.getPerunPrincipal().userId)
      .subscribe((atts) => {
        const userPrefLang = atts.find((elem) => elem.friendlyName === 'preferredLanguage');
        const userLang = (userPrefLang?.value as string) ?? null;

        const prefLang = this.preferredLangService.getPreferredLanguage(userLang);
        this.translateService.use(prefLang);
      });
  }

  isMobile(): boolean {
    return window.innerWidth <= AppComponent.minWidth;
  }

  isServiceLogin(): boolean {
    return !!sessionStorage.getItem('baLogout');
  }

  ngAfterViewInit(): void {
    const footerHeight: string = this.footer?.nativeElement?.offsetHeight?.toString() ?? '0';
    this.contentHeight = 'calc(100vh - 84px - ' + footerHeight + 'px)';
    this.changeDetector.detectChanges();
  }
}
