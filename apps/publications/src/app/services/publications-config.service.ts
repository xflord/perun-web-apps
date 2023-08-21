import { Injectable } from '@angular/core';
import {
  GuiAuthResolver,
  InitAuthService,
  MfaHandlerService,
} from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicationsConfigService {
  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private location: Location,
    private authzSevice: AuthzResolverService,
    private guiAuthResolver: GuiAuthResolver,
    private mfaHandlerService: MfaHandlerService
  ) {}

  loadConfigs(): Promise<void> {
    return this.appConfigService
      .loadAppDefaultConfig()
      .then(() => this.appConfigService.loadAppInstanceConfig())
      .then(() => this.appConfigService.setApiUrl())
      .then(() => this.initAuthService.verifyAuth())
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

          return this.initAuthService
            .loadPrincipal()
            .then(() => this.loadPolicies())
            .then(() => this.appConfigService.loadAppsConfig())
            .then(() => this.initAuthService.checkRouteGuard());
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }

  private loadPolicies(): Promise<void> {
    return firstValueFrom(this.authzSevice.getAllPolicies()).then((policies) => {
      this.guiAuthResolver.setPerunPolicies(policies);
    });
  }
}
