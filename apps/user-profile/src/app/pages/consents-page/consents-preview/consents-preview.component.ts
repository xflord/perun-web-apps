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
  loading = false;
  unsignedConsents: Consent[] = [];
  signedConsents: Consent[] = [];
  filterValueUnsigned = '';
  filterValueSigned = '';

  constructor(
    private router: Router,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private storeService: StoreService,
    private consentService: ConsentsManagerService
  ) {}

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

  grantAll(): void {
    //call to backend
    this.loading = true;
    this.notificator.showSuccess(
      this.translate.instant('CONSENTS.GRANT_ALL_NOTIFICATION') as string
    );
    this.loading = false;
  }

  rejectConsent(id: number): void {
    this.loading = true;
    this.consentService.changeConsentStatus(id, 'REVOKED').subscribe(
      () => {
        const consent =
          this.unsignedConsents.find((c) => c.id === id) ??
          this.signedConsents.find((c) => c.id === id);
        this.moveConsent(consent);
        const translatedNotification =
          consent.status === 'GRANTED'
            ? (this.translate.instant('CONSENTS.CONSENT_REVOKED') as string)
            : (this.translate.instant('CONSENTS.CONSENT_REJECTED') as string);
        consent.status = 'REVOKED';
        this.notificator.showSuccess(translatedNotification + consent.consentHub.name);
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  moveConsent(consent: Consent): void {
    if (consent.status === 'UNSIGNED') {
      this.signedConsents = [...this.signedConsents, consent];
      this.unsignedConsents = this.unsignedConsents.filter((c) => c.id !== consent.id);
    }
  }

  grantConsent(id: number): void {
    this.loading = true;
    this.consentService.changeConsentStatus(id, 'GRANTED').subscribe(
      () => {
        const consent =
          this.unsignedConsents.find((c) => c.id === id) ??
          this.signedConsents.find((c) => c.id === id);
        this.moveConsent(consent);
        consent.status = 'GRANTED';
        this.notificator.showSuccess(
          (this.translate.instant('CONSENTS.CONSENT_GRANTED') as string) + consent.consentHub.name
        );
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  applyFilterUnsigned($event: string): void {
    this.filterValueUnsigned = $event;
  }

  applyFilterSigned($event: string): void {
    this.filterValueSigned = $event;
  }
}
