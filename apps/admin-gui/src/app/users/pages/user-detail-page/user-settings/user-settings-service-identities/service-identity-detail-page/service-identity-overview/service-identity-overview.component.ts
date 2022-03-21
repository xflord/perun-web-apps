import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-service-identity-overview',
  templateUrl: './service-identity-overview.component.html',
  styleUrls: ['./service-identity-overview.component.css'],
})
export class ServiceIdentityOverviewComponent implements OnInit {
  constructor() {}

  navItems: MenuItem[] = [];

  ngOnInit(): void {
    this.initNavItems();
  }

  private initNavItems() {
    this.navItems = [
      {
        cssIcon: 'perun-manager',
        url: `associated-users`,
        label: 'MENU_ITEMS.USER.ASSOCIATED_USERS',
        style: 'user-btn',
      },
    ];
  }
}
