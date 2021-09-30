import { Component, OnInit } from '@angular/core';
import { LinkerResult, OpenLinkerService } from '@perun-web-apps/lib-linker';
import {
  EnrichedExtSource,
  EnrichedIdentity,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-connect-identity-section',
  templateUrl: './connect-identity-section.component.html',
  styleUrls: ['./connect-identity-section.component.css'],
})
export class ConnectIdentitySectionComponent implements OnInit {
  similarIdentities: EnrichedIdentity[] = [];
  loading = false;
  titleHelpTranslatePath = 'SIMILAR_FOUND';

  constructor(
    private registrarService: RegistrarManagerService,
    private router: Router,
    private openLinkerService: OpenLinkerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.registrarService.checkForSimilarRichIdentities().subscribe((similarIdentities) => {
      this.similarIdentities = similarIdentities.slice(0, 2);
      if (this.similarIdentities.length === 0) {
        this.titleHelpTranslatePath = 'NO_SIMILAR_FOUND';
      }
      this.loading = false;
    });
  }

  openPopUp(extSources: EnrichedExtSource[]): void {
    const idpFilter: string[] = [];
    extSources.forEach((extSource) => {
      if (extSource.attributes['sourceIdPName']) {
        idpFilter.push(extSource.extSource.name);
      }
    });
    this.openLinkerService.openLinkerWindow((result: LinkerResult) => {
      if (result === 'TOKEN_EXPIRED') {
        location.reload();
      } else if (result === 'OK' || result === 'MESSAGE_SENT_TO_SUPPORT') {
        void this.router.navigate(['/result', result]);
      }
    }, idpFilter);
  }
}
