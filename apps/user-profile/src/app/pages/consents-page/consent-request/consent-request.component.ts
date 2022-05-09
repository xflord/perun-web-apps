import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiRequestConfigurationService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Consent, ConsentsManagerService } from '@perun-web-apps/perun/openapi';
import { RPCError } from '@perun-web-apps/perun/models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'perun-web-apps-consent-request',
  templateUrl: './consent-request.component.html',
  styleUrls: ['./consent-request.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConsentRequestComponent implements OnInit {
  consent: Consent;
  loading = false;

  constructor(
    private notificator: NotificatorService,
    private translate: TranslateService,
    private consentService: ConsentsManagerService,
    private route: ActivatedRoute,
    private apiRequest: ApiRequestConfigurationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe((params) => {
      const consentId = Number(params['consentId']);
      this.apiRequest.dontHandleErrorForNext();
      this.consentService.getConsentById(consentId).subscribe(
        (consent) => {
          this.consent = consent;
          if (this.consent.status !== 'UNSIGNED') {
            void this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
          }
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          const e: RPCError = error.error as RPCError;
          if (e.name !== 'ConsentNotExistsException') {
            this.notificator.showRPCError(e);
          }
          void this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
        }
      );
    });
  }

  grantConsent(): void {
    this.loading = true;
    this.consentService.changeConsentStatus(this.consent.id, 'GRANTED').subscribe(
      () => {
        this.notificator.showSuccess(
          (this.translate.instant('CONSENTS.CONSENT_GRANTED') as string) +
            this.consent.consentHub.name
        );
        void this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
      },
      () => (this.loading = false)
    );
  }

  rejectConsent(): void {
    this.loading = true;
    this.consentService.changeConsentStatus(this.consent.id, 'REVOKED').subscribe(
      () => {
        this.notificator.showSuccess(
          (this.translate.instant('CONSENTS.CONSENT_REJECTED') as string) +
            this.consent.consentHub.name
        );
        void this.router.navigate(['/profile', 'consents'], { queryParamsHandling: 'merge' });
      },
      () => (this.loading = false)
    );
  }
}
