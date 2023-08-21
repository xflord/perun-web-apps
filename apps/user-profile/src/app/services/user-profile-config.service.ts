import { Injectable } from '@angular/core';
import { InitAuthService, MfaHandlerService } from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserProfileConfigService {
  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private location: Location,
    private mfaHandlerService: MfaHandlerService
  ) {}

  initialize(): Promise<void> {
    return this.appConfigService
      .loadAppDefaultConfig()
      .then(() => this.appConfigService.loadAppInstanceConfig())
      .then(() => this.appConfigService.setApiUrl())
      .then(() => this.appConfigService.setInstanceFavicon())
      .then(() => this.initAuthService.verifyAuth())
      .catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        this.mfaHandlerService.catchNoMfaTokenError(err?.params?.error);
        // if there is an error, it means user probably navigated to /api-callback without logging in
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

          return this.initAuthService
            .loadPrincipal()
            .then(() => this.appConfigService.loadAppsConfig())
            .then(() => this.initAuthService.checkRouteGuard());
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }
}
