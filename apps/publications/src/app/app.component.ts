import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { GuiAuthResolver, InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{

  constructor(private store: StoreService,
              private initAuth: InitAuthService,
              private changeDetector: ChangeDetectorRef,
              private authResolver: GuiAuthResolver,
              private router: Router) {
  }

  public static minWidth = 992;
  sidebarMode: 'over' | 'push' | 'side' = 'side';
  isLoginScreenShow: boolean;

  sideMenuBgColor = this.store.get('theme', 'sidemenu_bg_color');
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');
  contentHeight =  'calc(100vh - 84px)';

  ngOnInit() {
    this.isLoginScreenShow = this.initAuth.isLoginScreenShown();
    const url = location.pathname;
    if(!this.authResolver.isCabinetAdmin() && (url === '/' || url.includes('/all-publications'))){
      this.router.navigate(['my-publications']);
    }
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
