import { Injectable } from '@angular/core';
import { InitAuthService } from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetConfigService {
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
      .then(() => this.appConfigService.setInstanceFavicon())
      .then(() => {
        const queryParams = location.search.substr(1);
        if (!queryParams.includes('token')) {
          return this.initAuthService.verifyAuth();
        } else {
          return Promise.resolve(true);
        }
      })
      .catch((err) => {
        this.location.go('/');
        location.reload();
        throw err;
      })
      .then((isAuthenticated) => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          const queryParams = location.search.substr(1);
          if (!queryParams.includes('token')) {
            return this.initAuthService.loadPrincipal();
          }
          return;
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }
}
