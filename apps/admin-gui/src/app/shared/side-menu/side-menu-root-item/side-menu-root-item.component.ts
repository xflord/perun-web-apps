import {Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {SideMenuItem} from '../side-menu.component';
import { openClose, rollInOut } from '@perun-web-apps/perun/animations';
import {MatSidenav} from '@angular/material/sidenav';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-side-menu-root-item',
  templateUrl: './side-menu-root-item.component.html',
  styleUrls: ['./side-menu-root-item.component.scss'],
  animations: [
    openClose,
    rollInOut
  ]
})
export class SideMenuRootItemComponent implements OnInit, OnChanges {

  currentUrl: string;

  constructor(
    private router: Router,
    private store: StoreService,
  ) {
    this.currentUrl = router.url;

    router.events.subscribe((_: NavigationEnd) => {
      if (_ instanceof NavigationEnd) {
        this.currentUrl = _.url;
      }
    });
  }

  @Input()
  item: SideMenuItem;

  @Input()
  index: number;

  @Input()
  showOpen: boolean;

  @Input()
  id = "";

  @ViewChild('collapse') collapseDiv: ElementRef;

  expanded = false;
  linkBgColor = this.store.get('theme', 'sidemenu_item_links_bg_color');
  linkTextColor = this.store.get('theme', 'sidemenu_item_links_text_color');
  iconColor = this.store.get('theme', 'sidemenu_item_icon_color');

  @Input()
  sideNav: MatSidenav;
  ngOnInit() {
    this.expanded = this.showOpen;
  }

  ngOnChanges(): void {
    this.expanded = this.showOpen;
  }

  toggle() {
    if (this.item.baseLink !== undefined) {
      this.navigate(this.item.baseLink);
    } else {
      this.expanded = !this.expanded;
    }
  }

  isActive(currentUrl: string, regexValue: string) {
    const regexp = new RegExp(regexValue);

    return regexp.test(currentUrl);
  }

  getBgClass() {
    if (this.item.baseColorClass) {
      return this.isActive(this.currentUrl, this.item.baseColorClassRegex) ? this.item.colorClass : this.item.baseColorClass;
    } else {
      return this.item.colorClass;
    }
  }

  navigate(url) {
    if (this.sideNav.mode === 'over') {
      this.sideNav.close().then(() => this.router.navigate(url));
    } else {
      this.router.navigate(url);
    }
  }
}
