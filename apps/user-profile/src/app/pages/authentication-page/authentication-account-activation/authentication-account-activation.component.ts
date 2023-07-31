import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-authentication-account-activation',
  templateUrl: './authentication-account-activation.component.html',
  styleUrls: ['./authentication-account-activation.component.scss'],
})
export class AuthenticationAccountActivationComponent implements OnInit {
  displayLocalAccount: boolean;
  displaySambaPassword: boolean;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    const displayedTabs = this.storeService.getProperty('displayed_tabs');
    this.displayLocalAccount = displayedTabs.includes('local_acc');
    this.displaySambaPassword = displayedTabs.includes('samba');
  }
}
