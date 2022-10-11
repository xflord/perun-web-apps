import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-service-identity-authentication-overview',
  templateUrl: './service-identity-authentication-overview.component.html',
  styleUrls: ['./service-identity-authentication-overview.component.scss'],
})
export class ServiceIdentityAuthenticationOverviewComponent implements OnInit {
  navItems: MenuItem[] = [];

  ngOnInit(): void {
    this.initNavItems();
  }

  private initNavItems(): void {
    this.navItems = [
      {
        cssIcon: 'perun-logins',
        url: `logins`,
        label: 'MENU_ITEMS.USER.LOGINS',
        style: 'user-btn',
      },
      {
        cssIcon: 'perun-certificates',
        url: `certificates`,
        label: 'MENU_ITEMS.USER.CERTIFICATES',
        style: 'user-btn',
      },
      {
        cssIcon: 'perun-key',
        url: `ssh-keys`,
        label: 'MENU_ITEMS.USER.SSH_KEYS',
        style: 'user-btn',
      },
    ];
  }
}
