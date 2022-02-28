import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-service-overview',
  templateUrl: './service-overview.component.html',
  styleUrls: ['./service-overview.component.scss'],
})
export class ServiceOverviewComponent implements OnInit {
  navItems: MenuItem[] = [];

  ngOnInit(): void {
    this.initNavItems();
  }

  private initNavItems(): void {
    this.navItems = [
      {
        cssIcon: 'perun-attributes',
        url: 'required-attributes',
        label: 'MENU_ITEMS.SERVICE.REQUIRED_ATTRIBUTES',
        style: 'service-btn',
      },
      {
        cssIcon: 'perun-service_destination',
        url: 'destinations',
        label: 'MENU_ITEMS.SERVICE.DESTINATIONS',
        style: 'service-btn',
      },
    ];
  }
}
