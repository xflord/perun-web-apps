import { Component, HostBinding } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.scss'],
})
export class AdminOverviewComponent {
  @HostBinding('class.router-component') true;

  navItems: MenuItem[] = [
    {
      cssIcon: 'perun-attributes',
      url: '/admin/attributes',
      label: 'MENU_ITEMS.ADMIN.ATTRIBUTES',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-user',
      url: '/admin/users',
      label: 'MENU_ITEMS.ADMIN.USERS',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-owner-grey',
      url: '/admin/owners',
      label: 'MENU_ITEMS.ADMIN.OWNERS',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-service',
      url: '/admin/services',
      label: 'MENU_ITEMS.ADMIN.SERVICES',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-preview',
      url: '/admin/visualizer',
      label: 'MENU_ITEMS.ADMIN.VISUALIZER',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-external-sources',
      url: '/admin/ext_sources',
      label: 'MENU_ITEMS.ADMIN.EXT_SOURCES',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-audit-log',
      url: '/admin/audit_log',
      label: 'MENU_ITEMS.ADMIN.AUDIT_LOG',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-consent-hubs',
      url: '/admin/consent_hubs',
      label: 'MENU_ITEMS.ADMIN.CONSENT_HUBS',
      style: 'admin-btn',
    },
    {
      cssIcon: 'perun-searcher',
      url: '/admin/searcher',
      label: 'MENU_ITEMS.ADMIN.SEARCHER',
      style: 'admin-btn',
    },
  ];
}
