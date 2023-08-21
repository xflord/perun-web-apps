import { Injectable } from '@angular/core';
import {
  GuiAuthResolver,
  InitAuthService,
  MfaHandlerService,
} from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import {
  PreventProxyOverloadDialogComponent,
  ServerDownDialogComponent,
} from '@perun-web-apps/general';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminGuiConfigService {
  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private authzSevice: AuthzResolverService,
    private dialog: MatDialog,
    private location: Location,
    private guiAuthResolver: GuiAuthResolver,
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
        if (err === 'Invalid path') {
          this.handleErr(err as string & HttpErrorResponse);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          this.mfaHandlerService.catchNoMfaTokenError(err?.params?.error);
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
          // if this application is opened just for MFA, then close the window after MFA is successfully done
          this.mfaHandlerService.closeMfaWindow();

          return this.initAuthService
            .loadPrincipal()
            .catch((err) => this.handleErr(err as string & HttpErrorResponse))
            .then(() => this.loadPolicies())
            .then(() => this.appConfigService.loadAppsConfig())
            .then(() => this.guiAuthResolver.loadRolesManagementRules())
            .then(() => this.initAuthService.checkRouteGuard());
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
    } else if (err.status !== 401) {
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
    return firstValueFrom(this.authzSevice.getAllPolicies()).then((policies) =>
      this.guiAuthResolver.setPerunPolicies(policies)
    );
  }
}
