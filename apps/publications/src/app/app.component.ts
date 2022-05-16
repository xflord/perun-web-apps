import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GuiAuthResolver, InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  static minWidth = 992;
  @ViewChild('footer') footer: ElementRef<HTMLDivElement>;
  sidebarMode: 'over' | 'push' | 'side' = 'side';
  isLoginScreenShow: boolean;
  isServiceAccess: boolean;

  sideMenuBgColor = this.store.get('theme', 'sidemenu_bg_color') as string;
  contentBackgroundColor = this.store.get('theme', 'content_bg_color') as string;
  contentHeight = 'calc(100vh - 64px)';

  constructor(
    private store: StoreService,
    private initAuth: InitAuthService,
    private changeDetector: ChangeDetectorRef,
    private authResolver: GuiAuthResolver,
    private router: Router
  ) {}

  @HostListener('window:resize', ['$event'])
  getScreenSize(): void {
    this.sidebarMode = this.isMobile() ? 'over' : 'side';
  }

  ngOnInit(): void {
    this.isLoginScreenShow = this.initAuth.isLoginScreenShown();
    this.isServiceAccess = this.initAuth.isServiceAccessLoginScreenShown();
    sessionStorage.removeItem('baLogout');
    const url = location.pathname;
    if (!this.authResolver.isCabinetAdmin() && (url === '/' || url.includes('/all-publications'))) {
      void this.router.navigate(['my-publications']);
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= AppComponent.minWidth;
  }

  setContentHeight(height: number): void {
    this.contentHeight = 'calc(100vh - 84px - ' + String(height) + 'px)';
    this.changeDetector.detectChanges();
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
