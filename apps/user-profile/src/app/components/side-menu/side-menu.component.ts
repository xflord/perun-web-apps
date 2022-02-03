import { Component, Input, OnInit } from '@angular/core';
import { SideMenuItem, SideMenuItemService } from '../../services/side-menu-item.service';
import { StoreService } from '@perun-web-apps/perun/services';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'perun-web-apps-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  private currentUrl: string;

  constructor(
    private sideMenuItemService: SideMenuItemService,
    private storeService: StoreService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.currentUrl = router.url;

    router.events.subscribe((_: NavigationEnd) => {
      if (_ instanceof NavigationEnd) {
        this.currentUrl = _.url;
      }
    });
  }

  @Input()
  sideNav: MatSidenav;

  items: SideMenuItem[] = [];
  lang = 'en';
  textColor = this.storeService.get('theme', 'sidemenu_text_color');
  iconColor = this.storeService.get('theme', 'sidemenu_item_icon_color');

  ngOnInit() {
    this.translateService.onLangChange.subscribe((lang) => {
      const { lang: lan } = lang;
      this.lang = lan;
    });
    const displayedTabs: string[] = this.storeService.get('displayed_tabs');
    this.items = this.sideMenuItemService.getSideMenuItems();

    this.items = this.items.filter((item) => displayedTabs.includes(item.tabName));
  }

  isActive(regexValue: string) {
    const regexp = new RegExp(regexValue);

    return regexp.test(this.currentUrl);
  }

  shouldHideMenu() {
    if (this.sideNav.mode === 'over') {
      this.sideNav.close();
    }
  }

  goToURL(link: string) {
    window.open(link, '_blank');
  }
}
