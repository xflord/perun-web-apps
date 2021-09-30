import { Injectable } from '@angular/core';
import { InitAuthService } from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ConsolidatorConfigService {
  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private location: Location
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
          return this.initAuthService
            .simpleLoadPrincipal()
            .then(() => this.appConfigService.loadAppsConfig());
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }
}
