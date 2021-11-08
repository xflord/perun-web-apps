import { Injectable } from '@angular/core';
import { InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetConfigService {

  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private storeService: StoreService,
    private location: Location,
    private authzSevice: AuthzResolverService
  ) { }

  loadConfigs(): Promise<void> {
    return this.appConfigService.loadAppDefaultConfig()
      .then(() => this.appConfigService.loadAppInstanceConfig())
      .then(() => this.setApiUrl())
      .then(() => this.appConfigService.setInstanceFavicon())
      .then(() => {
        const queryParams = location.search.substr(1);
        if(!queryParams.includes('token')) {
          return this.initAuthService.verifyAuth();
        } else {
          return Promise.resolve(true);
        }
      })
      .catch(err => {
        console.error(err);
        this.location.go("/");
        location.reload();
        throw err;
      })
      .then(isAuthenticated => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          return;
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }

  private setApiUrl(): Promise<void> {
    return new Promise((resolve) => {
      this.authzSevice.configuration.basePath = this.storeService.get('api_url');
      resolve();
    });
  }

}
