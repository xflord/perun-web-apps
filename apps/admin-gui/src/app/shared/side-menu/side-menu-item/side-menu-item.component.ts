import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SideMenuItem } from '../side-menu.component';
import { NavigationEnd, Router } from '@angular/router';
import { openClose, rollInOut } from '@perun-web-apps/perun/animations';
import { MatSidenav } from '@angular/material/sidenav';
import { StoreService } from '@perun-web-apps/perun/services';
import { QueryParamsRouterService } from '../../query-params-router.service';

@Component({
  selector: 'app-side-menu-item',
  templateUrl: './side-menu-item.component.html',
  styleUrls: ['./side-menu-item.component.scss'],
  animations: [openClose, rollInOut],
})
export class SideMenuItemComponent {
  @Input()
  item: SideMenuItem;
  @Input()
  index: number;
  @Input()
  showLinks: boolean;
  @ViewChild('collapse') collapseDiv: ElementRef;
  @Input()
  sideNav: MatSidenav;
  currentUrl: string;
  expanded = true;
  linkBgColor = this.store.getProperty('theme').sidemenu_submenu_bg_color;
  linkTextColor = this.store.getProperty('theme').sidemenu_submenu_text_color;
  dividerStyle = '1px solid ' + this.store.getProperty('theme').sidemenu_divider_color;

  constructor(
    private router: Router,
    private store: StoreService,
    private queryParamsRouter: QueryParamsRouterService
  ) {
    this.currentUrl = router.url;

    router.events.subscribe((_: NavigationEnd) => {
      if (_ instanceof NavigationEnd) {
        this.currentUrl = _.url;
      }
    });
  }

  toggle(): void {
    if (this.item.baseLink !== undefined) {
      this.navigate(this.item.baseLink);
      // this.router.navigate(this.item.baseLink);
      // this.closeOnSmallDevice();
    } else {
      // this.expanded = !this.expanded;
    }
  }

  isActive(currentUrl: string, regexValue: string): boolean {
    const regexp = new RegExp(regexValue);

    return regexp.test(currentUrl.split('?')[0]);
  }

  navigate(url: string[]): void {
    if (this.sideNav.mode === 'over') {
      void this.sideNav.close().then(() => this.queryParamsRouter.navigate(url));
    } else {
      this.queryParamsRouter.navigate(url);
    }
  }
}
