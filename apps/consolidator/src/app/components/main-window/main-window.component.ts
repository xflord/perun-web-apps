import { Component, OnInit } from '@angular/core';
import { InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import {
  EnrichedExtSource,
  EnrichedIdentity,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { LinkerResult, OpenLinkerService } from '@perun-web-apps/lib-linker';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.css'],
})
export class MainWindowComponent implements OnInit {
  loading = false;
  unknownIdentity: boolean;
  similarIdentities: EnrichedIdentity[] = [];
  titleHelpTranslatePath = 'SIMILAR_FOUND';
  reloadData = 0;

  constructor(
    private storeService: StoreService,
    private initService: InitAuthService,
    private registrarService: RegistrarManagerService,
    private router: Router,
    private openLinkerService: OpenLinkerService
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  initData(): void {
    this.loading = true;
    void this.initService.simpleLoadPrincipal().then(() => {
      this.unknownIdentity = this.storeService.getPerunPrincipal().userId === -1;
      this.reloadSimilarIdentities();
    });
  }

  reloadSimilarIdentities(): void {
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
      } else if (result === 'OK') {
        this.reloadData++;
        this.initData();
      } else if (result === 'MESSAGE_SENT_TO_SUPPORT') {
        void this.router.navigate(['/result', result]);
      }
    }, idpFilter);
  }
}
