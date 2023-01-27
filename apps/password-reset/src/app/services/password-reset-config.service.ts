import { Injectable } from '@angular/core';
import { InitAuthService, MfaHandlerService } from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetConfigService {
  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private location: Location,
    private mfaHandlerService: MfaHandlerService
  ) {}

  loadConfigs(): Promise<void> {
    return this.appConfigService
      .loadAppDefaultConfig()
      .then(() => this.appConfigService.loadAppInstanceConfig())
      .then(() => this.appConfigService.setApiUrl())
      .then(() => this.appConfigService.setInstanceFavicon())
      .then(() => {
        const queryParams = location.search.substring(1);
        if (!queryParams.includes('token')) {
          return this.initAuthService.verifyAuth();
        } else {
          return Promise.resolve(true);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        this.mfaHandlerService.catchNoMfaTokenError(err?.params?.error);
        console.error(err);
        this.location.go('/');
        location.reload();
        throw err;
      })
      .then((isAuthenticated) => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          // if this application is opened just for MFA, then close the window after MFA is successfully done
          this.mfaHandlerService.closeMfaWindow();

          const queryParams = location.search.substring(1);
          if (!queryParams.includes('token')) {
            return this.initAuthService
              .loadPrincipal()
              .then(() => this.appConfigService.loadAppsConfig())
              .then(() => this.initAuthService.checkRouteGuard());
          }
          return;
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }
}
