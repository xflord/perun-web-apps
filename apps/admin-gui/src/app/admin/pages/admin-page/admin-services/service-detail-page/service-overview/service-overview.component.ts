import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { Service } from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-service-overview',
  templateUrl: './service-overview.component.html',
  styleUrls: ['./service-overview.component.scss'],
})
export class ServiceOverviewComponent implements OnInit {
  navItems: MenuItem[] = [];
  service: Service;

  constructor(private entityStorageService: EntityStorageService) {}

  ngOnInit(): void {
    this.service = this.entityStorageService.getEntity();
    this.initNavItems();
  }

  private initNavItems(): void {
    this.navItems = [
      {
        cssIcon: 'perun-attributes',
        url: `/admin/services/${this.service.id}/required-attributes`,
        label: 'MENU_ITEMS.SERVICE.REQUIRED_ATTRIBUTES',
        style: 'service-btn',
      },
      {
        cssIcon: 'perun-service_destination',
        url: `/admin/services/${this.service.id}/destinations`,
        label: 'MENU_ITEMS.SERVICE.DESTINATIONS',
        style: 'service-btn',
      },
    ];
  }
}
