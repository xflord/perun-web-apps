import { Component, OnInit } from '@angular/core';
import { ConsentHub, ConsentsManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_CONSENT_HUBS } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import {
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-perun-web-apps-admin-consent-hubs',
  templateUrl: './admin-consent-hubs.component.html',
  styleUrls: ['./admin-consent-hubs.component.scss'],
})
export class AdminConsentHubsComponent implements OnInit {
  loading = false;
  tableId = TABLE_CONSENT_HUBS;
  selection = new SelectionModel<ConsentHub>(true, []);
  filterValue = '';
  consentHubs: ConsentHub[] = [];
  globalForceConsents: boolean;

  constructor(
    private consentsManager: ConsentsManagerService,
    public authResolver: GuiAuthResolver,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private store: StoreService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.globalForceConsents = this.store.getProperty('enforce_consents');
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

  evaluateConsents(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      title: this.translate.instant('ADMIN.CONSENT_HUBS.CONFIRM_DIALOG_TITLE'),
      theme: 'admin-theme',
      description: this.translate.instant('ADMIN.CONSENT_HUBS.CONFIRM_DIALOG_DESCRIPTION'),
      items: this.selection.selected.map((hub) => hub.name),
      type: 'confirmation',
      showAsk: false,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.evaluateConsentsForConsentHubs();
      }
    });
  }

  evaluateConsentsForConsentHubs(): void {
    this.loading = true;

    const consentHubIds = this.selection.selected.map((consentHub) => consentHub.id);
    this.consentsManager.evaluateConsentsForConsentHubs(consentHubIds).subscribe({
      next: () => {
        this.notificator.showSuccess(
          this.translate.instant('ADMIN.CONSENT_HUBS.EVALUATION_FINISH'),
        );
        this.selection.clear();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
