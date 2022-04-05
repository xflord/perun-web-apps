import { Component, OnInit } from '@angular/core';
import { ConsentHub, ConsentsManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_CONSENT_HUBS } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-perun-web-apps-admin-consent-hubs',
  templateUrl: './admin-consent-hubs.component.html',
  styleUrls: ['./admin-consent-hubs.component.scss'],
})
export class AdminConsentHubsComponent implements OnInit {
  constructor(private consentsManager: ConsentsManagerService) {}

  loading = false;
  tableId = TABLE_CONSENT_HUBS;
  filterValue = '';
  consentHubs: ConsentHub[] = [];

  ngOnInit(): void {
    this.refreshTable();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  refreshTable(): void {
    this.loading = true;

    this.consentsManager.getAllConsentHubs().subscribe((consentHubs) => {
      this.consentHubs = consentHubs;
      this.loading = false;
    });
  }
}
