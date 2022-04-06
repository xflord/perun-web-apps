import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiRequestConfigurationService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Consent, ConsentsManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-consent-request',
  templateUrl: './consent-request.component.html',
  styleUrls: ['./consent-request.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConsentRequestComponent implements OnInit {
  constructor(
    private notificator: NotificatorService,
    private translate: TranslateService,
    private consentService: ConsentsManagerService,
    private route: ActivatedRoute,
    private apiRequest: ApiRequestConfigurationService,
    private router: Router
  ) {}

  consent: Consent;
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe((params) => {
      const consentId = params['consentId'];
      this.apiRequest.dontHandleErrorForNext();
      this.consentService.getConsentById(consentId).subscribe(
        (consent) => {
          this.consent = consent;
          if (this.consent.status !== 'UNSIGNED') {
            this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          if (error.error.name !== 'ConsentNotExistsException') {
            this.notificator.showRPCError(error.error);
          }
          this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
        }
      );
    });
  }

  grantConsent() {
    this.loading = true;
    this.consentService.changeConsentStatus(this.consent.id, 'GRANTED').subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('CONSENTS.CONSENT_GRANTED') + this.consent.consentHub.name
        );
        this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
      },
      () => (this.loading = false)
    );
  }

  rejectConsent() {
    this.loading = true;
    this.consentService.changeConsentStatus(this.consent.id, 'REVOKED').subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('CONSENTS.CONSENT_REJECTED') + this.consent.consentHub.name
        );
        this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
      },
      () => (this.loading = false)
    );
  }
}
