import { Injectable } from '@angular/core';
import { InitAuthService } from '@perun-web-apps/perun/services';
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
      configValue: 'sidemenu-link-active',
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
    private location: Location
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
        // if there is an error, it means user probably navigated to /api-callback without logging in
        console.error(err);
        this.location.go('/');
        location.reload();
        throw err;
      })
      .then((isAuthenticated) => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          return this.initAuthService
            .loadPrincipal()
            .then(() => this.appConfigService.loadAppsConfig());
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }
}
