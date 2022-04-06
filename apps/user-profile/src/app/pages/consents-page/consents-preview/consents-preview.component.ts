import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { Consent, ConsentsManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-consents-preview',
  templateUrl: './consents-preview.component.html',
  styleUrls: ['./consents-preview.component.scss'],
})
export class ConsentsPreviewComponent implements OnInit {
  constructor(
    private router: Router,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private storeService: StoreService,
    private consentService: ConsentsManagerService
  ) {}

  loading = false;
  unsignedConsents: Consent[] = [];
  signedConsents: Consent[] = [];
  filterValueUnsigned = '';
  filterValueSigned = '';

  ngOnInit(): void {
    this.loading = true;
    this.consentService.getConsentsForUser(this.storeService.getPerunPrincipal().userId).subscribe(
      (consents) => {
        this.unsignedConsents = consents.filter((item) => item.status === 'UNSIGNED');
        this.signedConsents = consents.filter((item) => item.status !== 'UNSIGNED');
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  grantAll() {
    //call to backend
    this.loading = true;
    this.notificator.showSuccess(this.translate.instant('CONSENTS.GRANT_ALL_NOTIFICATION'));
    this.loading = false;
  }

  rejectConsent(id: number) {
    this.loading = true;
    this.consentService.changeConsentStatus(id, 'REVOKED').subscribe(
      () => {
        const consent =
          this.unsignedConsents.find((c) => c.id === id) ??
          this.signedConsents.find((c) => c.id === id);
        this.moveConsent(consent);
        const translatedNotification =
          consent.status === 'GRANTED'
            ? this.translate.instant('CONSENTS.CONSENT_REVOKED')
            : this.translate.instant('CONSENTS.CONSENT_REJECTED');
        consent.status = 'REVOKED';
        this.notificator.showSuccess(translatedNotification + consent.consentHub.name);
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  moveConsent(consent: Consent) {
    if (consent.status === 'UNSIGNED') {
      this.signedConsents = [...this.signedConsents, consent];
      this.unsignedConsents = this.unsignedConsents.filter((c) => c.id !== consent.id);
    }
  }

  grantConsent(id: number) {
    this.loading = true;
    this.consentService.changeConsentStatus(id, 'GRANTED').subscribe(
      () => {
        const consent =
          this.unsignedConsents.find((c) => c.id === id) ??
          this.signedConsents.find((c) => c.id === id);
        this.moveConsent(consent);
        consent.status = 'GRANTED';
        this.notificator.showSuccess(
          this.translate.instant('CONSENTS.CONSENT_GRANTED') + consent.consentHub.name
        );
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  applyFilterUnsigned($event: string) {
    this.filterValueUnsigned = $event;
  }

  applyFilterSigned($event: string) {
    this.filterValueSigned = $event;
  }
}
