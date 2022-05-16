import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CacheHelperService } from './core/services/common/cache-helper.service';
import { InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';
import { interval } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { NewVersionDialogComponent } from './shared/components/dialogs/new-version-dialog/new-version-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Params, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

// eslint-disable-next-line
declare let require: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  static minWidth = 992;

  @ViewChild('footer') footer: ElementRef<HTMLDivElement>;

  sidebarMode: 'over' | 'push' | 'side' = 'side';
  lastScreenWidth: number;

  isLoginScreenShow: boolean;
  isServiceAccess: boolean;

  principal: PerunPrincipal;
  navBackgroundColor = this.store.get('theme', 'nav_bg_color') as string;
  sideBarBorderColor = this.store.get('theme', 'sidemenu_border_color') as string;
  contentBackgroundColor = this.store.get('theme', 'content_bg_color') as string;
  sideMenubackgroundColor = this.store.get('theme', 'sidemenu_bg_color') as string;

  displayWarning: boolean = this.store.get('display_warning') as boolean;
  warningMessage: string = this.store.get('warning_message') as string;

  // eslint-disable-next-line
  version: string = require('../../../../package.json').version;
  contentInnerMinHeight: string = this.displayWarning
    ? 'calc(100vh - 112px)'
    : 'calc(100vh - 64px)';

  constructor(
    private cache: CacheHelperService,
    private store: StoreService,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private initAuth: InitAuthService,
    private cd: ChangeDetectorRef
  ) {
    this.cache.init();
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(): void {
    this.sidebarMode = this.isMobile() ? 'over' : 'side';

    this.lastScreenWidth = window.innerWidth;
  }

  isServiceLogin(): boolean {
    return !!sessionStorage.getItem('baLogout');
  }

  isMobile(): boolean {
    return window.innerWidth <= AppComponent.minWidth;
  }

  ngOnInit(): void {
    this.isLoginScreenShow = this.initAuth.isLoginScreenShown();
    this.isServiceAccess = this.initAuth.isServiceAccessLoginScreenShown();
    sessionStorage.removeItem('baLogout');

    if (sessionStorage.getItem('initPage') === null) {
      sessionStorage.setItem('initPage', location.pathname);
      sessionStorage.setItem('onInitPage', 'true');
    }
    this.store.setInitialPageId(1);
    this.principal = this.store.getPerunPrincipal();
    this.loadAppVersion();
    interval(30000).subscribe(() => {
      this.loadAppVersion();
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        //TODO FIX this method
        this.updateInitAccessedPage(event);
      });
  }

  //TODO fix this method
  // only relevant in situation when user enters app on other than home page
  // this method can falsely evaluate page as initial in this scenario:
  // user accesses page A with url 'abc', page A is the initial page,
  // user than navigates through application
  // to page B with same url 'abc', user reloads application on page B
  // continues to navigate through application
  // if he accesses page B before page A (using forward/back buttons)

  getTopGap(): number {
    return this.displayWarning ? 112 : 64;
  }

  getSideNavMarginTop(): string {
    return this.displayWarning ? '112px' : '64px';
  }

  getSideNavMinHeight(): string {
    return this.displayWarning ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)';
  }

  getNavMenuTop(): string {
    return this.displayWarning ? '48px' : '0';
  }

  ngAfterViewInit(): void {
    const footerHeight: string = this.footer?.nativeElement?.offsetHeight?.toString() ?? '0';
    this.contentInnerMinHeight = this.displayWarning
      ? 'calc(100vh - ' + footerHeight + 'px - 112px)'
      : 'calc(100vh - ' + footerHeight + 'px - 64px)';
    this.cd.detectChanges();
  }

  // page B will be falsely evaluated as initial
  private updateInitAccessedPage(event: NavigationStart): void {
    if (event.url === sessionStorage.getItem('initPage')) {
      if (event.navigationTrigger === 'imperative' && event.id !== this.store.getInitialPageId()) {
        sessionStorage.setItem('onInitPage', 'false');
      }
      if (event.navigationTrigger === 'popstate') {
        if (event.restoredState.navigationId === this.store.getInitialPageId()) {
          sessionStorage.setItem('onInitPage', 'true');
          this.store.setInitialPageId(event.id);
        } else {
          sessionStorage.setItem('onInitPage', 'false');
        }
      }
    } else {
      sessionStorage.setItem('onInitPage', 'false');
    }
  }

  private loadAppVersion(): void {
    const httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0',
    });
    this.http
      .get('/assets/config/version.json', { headers: httpHeaders })
      .subscribe((result: Params) => {
        const recentVersion: string = result['version'] as string;
        if (recentVersion) {
          if (this.version && recentVersion !== 'SNAPSHOT' && this.version !== recentVersion) {
            const config = getDefaultDialogConfig();
            this.dialog.open(NewVersionDialogComponent, config);
          } else {
            this.version = recentVersion;
          }
        }
      });
  }
}
