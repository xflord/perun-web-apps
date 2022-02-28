import { Injectable } from '@angular/core';
import { GuiAuthResolver, InitAuthService } from '@perun-web-apps/perun/services';
import { AppConfigService, ColorConfig, EntityColorConfig } from '@perun-web-apps/config';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import {
  PreventProxyOverloadDialogComponent,
  ServerDownDialogComponent,
} from '@perun-web-apps/general';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminGuiConfigService {
  entityColorConfigs: EntityColorConfig[] = [
    {
      entity: 'vo',
      configValue: 'vo_color',
      cssVariable: '--vo-color',
    },
    {
      entity: 'group',
      configValue: 'group_color',
      cssVariable: '--group-color',
    },
    {
      entity: 'user',
      configValue: 'user_color',
      cssVariable: '--user-color',
    },
    {
      entity: 'member',
      configValue: 'member_color',
      cssVariable: '--member-color',
    },
    {
      entity: 'facility',
      configValue: 'facility_color',
      cssVariable: '--facility-color',
    },
    {
      entity: 'resource',
      configValue: 'resource_color',
      cssVariable: '--resource-color',
    },
    {
      entity: 'admin',
      configValue: 'admin_color',
      cssVariable: '--admin-color',
    },
    {
      entity: 'service',
      configValue: 'service_color',
      cssVariable: '--service-color',
    },
  ];

  colorConfigs: ColorConfig[] = [
    {
      configValue: 'sidemenu_hover_color',
      cssVariable: '--side-root-item-hover',
    },
    {
      configValue: 'sidemenu_root_active_color',
      cssVariable: '--side-root-item-active',
    },
    {
      configValue: 'sidemenu-link-active',
      cssVariable: '--side-link-active',
    },
    {
      configValue: 'sidemenu-link-hover',
      cssVariable: '--side-link-hover',
    },
  ];

  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private authzSevice: AuthzResolverService,
    private dialog: MatDialog,
    private location: Location,
    private guiAuthResolver: GuiAuthResolver
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
        if (err === 'Invalid path') {
          this.handleErr(err as string & HttpErrorResponse);
        } else {
          // if there is another error, it means user probably navigated to /api-callback without logging in
          console.error(err);
          this.location.go('/');
          location.reload();
          throw err;
        }
      })
      .then((isAuthenticated) => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          return this.initAuthService
            .loadPrincipal()
            .catch((err) => this.handleErr(err as string & HttpErrorResponse))
            .then(() => this.loadPolicies())
            .then(() => this.appConfigService.loadAppsConfig())
            .then(() => this.guiAuthResolver.loadRolesManagementRules());
        } else {
          return this.initAuthService.handleAuthStart();
        }
      });
  }

  private handleErr(err: string & HttpErrorResponse): void {
    const config = getDefaultDialogConfig();
    // FIXME: during initialization phase, it might happen that the translations are not loaded.
    if (err === 'Invalid path') {
      config.data = {
        title: 'GENERAL.PROXY_OVERLOAD_PREVENTION.TITLE',
        message: 'GENERAL.PROXY_OVERLOAD_PREVENTION.MESSAGE',
        action: 'GENERAL.PROXY_OVERLOAD_PREVENTION.ACTION',
      };

      this.dialog.open(PreventProxyOverloadDialogComponent, config);
    } else {
      config.data = {
        title: 'GENERAL.PRINCIPAL_ERROR.TITLE',
        message: err.status === 0 ? 'GENERAL.PRINCIPAL_ERROR.MESSAGE' : err.message,
        action: 'GENERAL.PRINCIPAL_ERROR.ACTION',
      };

      this.dialog.open(ServerDownDialogComponent, config);
    }
    console.error(err);
    throw err;
  }

  private loadPolicies(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authzSevice.getAllPolicies().subscribe(
        (policies) => {
          this.guiAuthResolver.setPerunPolicies(policies);
          resolve();
        },
        (error) => reject(error)
      );
    });
  }
}
