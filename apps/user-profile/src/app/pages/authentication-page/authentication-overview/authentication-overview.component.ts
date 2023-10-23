import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { PerunTranslateService, StoreService } from '@perun-web-apps/perun/services';
import { TabItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'perun-web-apps-authentication-overview',
  templateUrl: './authentication-overview.component.html',
  styleUrls: ['./authentication-overview.component.scss'],
})
export class AuthenticationOverviewComponent implements OnInit {
  @ViewChild('toggle') toggle: MatSlideToggle;
  items: TabItem[] = [];
  loading = false;

  constructor(
    private translate: PerunTranslateService,
    private storeService: StoreService,
  ) {}

  ngOnInit(): void {
    this.initItems();
    const displayedTabs: string[] = this.storeService.getProperty('displayed_tabs');
    this.items = this.items.filter((item) => displayedTabs.includes(item.tabName));
  }

  private initItems(): void {
    this.items = [
      {
        icon: 'lock_open',
        url: `/profile/auth/accountActivation`,
        label: 'AUTHENTICATION.ACCOUNT_ACTIVATION',
        tabName: 'accountActivation',
      },
      {
        icon: 'password',
        url: `/profile/auth/altPasswords`,
        label: 'AUTHENTICATION.ALTERNATIVE_PASSWORDS',
        tabName: 'alt_passwords',
      },
      {
        icon: 'dangerous',
        url: `/profile/auth/antiPhishingSecurity`,
        label: 'AUTHENTICATION.ANTI_PHISHING',
        tabName: 'anti_phishing',
      },
      {
        icon: 'lock',
        url: `/profile/auth/passwordReset`,
        label: 'AUTHENTICATION.PASSWORD_RESET',
        tabName: 'password_reset',
      },
      {
        icon: 'security',
        url: `/profile/auth/mfa`,
        label: 'AUTHENTICATION.MFA',
        tabName: 'mfa',
      },
      {
        icon: 'vpn_key',
        url: `/profile/auth/sshKeys`,
        label: 'AUTHENTICATION.SSH_KEYS',
        tabName: 'ssh_keys',
      },
    ];
  }
}
