import { Injectable } from '@angular/core';
import { InitAuthService } from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';
import { LinkIdentitiesService } from './link-identities.service';

@Injectable({
  providedIn: 'root',
})
export class LinkerConfigService {
  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private location: Location,
    private linkIdentitiesService: LinkIdentitiesService
  ) {}

  loadConfigs(): Promise<void> {
    return this.appConfigService
      .loadAppDefaultConfig()
      .then(() => this.appConfigService.loadAppInstanceConfig())
      .then(() => this.appConfigService.setApiUrl())
      .then(() => this.initAuthService.verifyAuth())
      .catch((err) => {
        console.error(err);
        this.location.go('/');
        location.reload();
        throw err;
      })
      .then((isAuthenticated) => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          return this.initAuthService.simpleLoadPrincipal().then(() => {
            return this.linkIdentitiesService.consolidate();
          });
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }
}
