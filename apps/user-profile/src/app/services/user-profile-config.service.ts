import { Injectable } from '@angular/core';
import { InitAuthService, MfaHandlerService } from '@perun-web-apps/perun/services';
import { AppConfigService, ColorConfig, EntityColorConfig } from '@perun-web-apps/config';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserProfileConfigService {
  entityColorConfigs: EntityColorConfig[] = [
    {
      entity: 'user',
      configValue: 'user_color',
      cssVariable: '--user-color',
      cssTextVariable: '--user-color-text',
    },
  ];

  colorConfigs: ColorConfig[] = [
    {
      configValue: 'sidemenu_bg_color',
      cssVariable: '--side-bg',
    },
    {
      configValue: 'sidemenu_hover_color',
      cssVariable: '--side-hover',
    },
    {
      configValue: 'sidemenu_hover_text_color',
      cssVariable: '--side-text-hover',
    },
    {
      configValue: 'sidemenu_active_color',
      cssVariable: '--side-active',
    },
    {
      configValue: 'sidemenu_active_text_color',
      cssVariable: '--side-text-active',
    },
  ];

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
      .then(() =>
        this.appConfigService.initializeColors(this.entityColorConfigs, this.colorConfigs)
      )
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
