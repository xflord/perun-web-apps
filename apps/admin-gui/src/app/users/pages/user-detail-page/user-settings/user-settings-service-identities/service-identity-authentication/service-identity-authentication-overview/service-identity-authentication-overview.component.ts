import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { User } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-service-identity-authentication-overview',
  templateUrl: './service-identity-authentication-overview.component.html',
  styleUrls: ['./service-identity-authentication-overview.component.scss'],
})
export class ServiceIdentityAuthenticationOverviewComponent implements OnInit {
  navItems: MenuItem[] = [];
  serviceAccount: User;

  constructor(private entityStorageService: EntityStorageService) {}

  ngOnInit(): void {
    this.serviceAccount = this.entityStorageService.getEntity();
    this.initNavItems();
  }

  private initNavItems(): void {
    this.navItems = [
      {
        cssIcon: 'perun-logins',
        url: `/myProfile/service-identities/${this.serviceAccount.id}/authentication/logins`,
        label: 'MENU_ITEMS.USER.LOGINS',
        style: 'user-btn',
      },
      {
        cssIcon: 'perun-certificates',
        url: `/myProfile/service-identities/${this.serviceAccount.id}/authentication/certificates`,
        label: 'MENU_ITEMS.USER.CERTIFICATES',
        style: 'user-btn',
      },
      {
        cssIcon: 'perun-key',
        url: `/myProfile/service-identities/${this.serviceAccount.id}/authentication/ssh-keys`,
        label: 'MENU_ITEMS.USER.SSH_KEYS',
        style: 'user-btn',
      },
    ];
  }
}
