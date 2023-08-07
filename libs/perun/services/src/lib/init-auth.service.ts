import { Injectable } from '@angular/core';
// eslint-disable-next-line
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { GuiAuthResolver } from './gui-auth-resolver.service';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { UserDontExistDialogComponent } from '@perun-web-apps/general';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Params, Router } from '@angular/router';
import { OAuthInfoEvent, OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs/operators';
import { firstValueFrom, timer } from 'rxjs';
import { MfaHandlerService } from './mfa-handler.service';
import { UserNotAllowedAccessComponent } from '@perun-web-apps/general';

@Injectable({
  providedIn: 'root',
})
export class InitAuthService {
  private loginScreenShown = false;
  private serviceAccess = false;
  private serviceAccessLoginScreen = false;

  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private storeService: StoreService,
    private authResolver: GuiAuthResolver,
    private authzService: AuthzResolverService,
    private dialog: MatDialog,
    private router: Router,
    private mfaHandlerService: MfaHandlerService
  ) {}

  isLoginScreenShown(): boolean {
    return this.loginScreenShown;
  }

  isServiceAccess(): boolean {
    return this.serviceAccess;
  }

  isServiceAccessLoginScreenShown(): boolean {
    return this.serviceAccessLoginScreen;
  }

  /**
   * Checks how user got to the page (with which metadata) and proceeds accordingly
   */
  verifyAuth(): Promise<boolean> {
    // if this application is opened just for MFA, then log out from single factor
    // and force multi factor authentication
    this.mfaHandlerService.mfaWindowForceLogout();

    if (sessionStorage.getItem('baPrincipal')) {
      this.serviceAccess = true;
      if (sessionStorage.getItem('auth:redirect')) {
        return this.redirectToOriginDestination();
      } else {
        return Promise.resolve(true);
      }
    } else if (
      location.pathname !== '/service-access' &&
      !this.storeService.getProperty('auto_service_access_redirect')
    ) {
      this.authService.loadOidcConfigData();

      const currentPathname = location.pathname;
      const queryParams = location.search.substring(1);

      if (currentPathname === '/api-callback') {
        return this.oauthService
          .loadDiscoveryDocumentAndTryLogin()
          .then(() => this.startRefreshToken())
          .then(() => this.redirectToOriginDestination());
      } else {
        return this.oauthService
          .loadDiscoveryDocument()
          .then(() => this.tryRefreshToken())
          .then(() => {
            if (this.storeService.getProperty('application') === 'Linker') {
              sessionStorage.setItem('auth:queryParams', queryParams);
              localStorage.removeItem('access_token');

              return false;
            }
            if (!this.oauthService.hasValidAccessToken()) {
              if (!this.isPotentiallyValidPath(currentPathname)) {
                return Promise.reject('Invalid path');
              }

              sessionStorage.setItem('auth:redirect', currentPathname);
              sessionStorage.setItem('auth:queryParams', queryParams);

              return false;
            }

            return this.startRefreshToken();
          });
      }
    }
  }

  /**
   * Load principal
   */
  loadPrincipal(): Promise<void> {
    return firstValueFrom(this.authzService.getPerunPrincipal()).then((perunPrincipal) => {
      if (perunPrincipal.user === null) {
        const config = getDefaultDialogConfig();
        this.dialog.open(UserDontExistDialogComponent, config);
      } else if (perunPrincipal.user.serviceUser) {
        const config = getDefaultDialogConfig();
        this.dialog
          .open(UserNotAllowedAccessComponent, config)
          .afterClosed()
          .subscribe(() => {
            this.authService.logout();
          });
      } else {
        this.storeService.setPerunPrincipal(perunPrincipal);
        this.authResolver.init(perunPrincipal);
      }
    });
  }

  /**
   * Load principal
   */
  simpleLoadPrincipal(): Promise<void> {
    return firstValueFrom(this.authzService.getPerunPrincipal()).then((perunPrincipal) => {
      this.storeService.setPerunPrincipal(perunPrincipal);
    });
  }

  checkRouteGuard(): void {
    const previousUrl = localStorage.getItem('routeAuthGuard');
    if (previousUrl) {
      localStorage.removeItem('routeAuthGuard');
      void this.router.navigate([previousUrl], { queryParamsHandling: 'merge' });
    }
  }

  /**
   * Handles the auth start. If the configuration property `auto_auth_redirect`
   * is set to true, a redirect to the oidc server will be made.
   * If the property is set to false, a redirect to local page /login will be
   * made.
   */
  handleAuthStart(): Promise<void> {
    if (
      this.storeService.getProperty('auto_service_access_redirect') &&
      location.pathname !== '/service-access'
    ) {
      this.serviceAccess = true;
      this.serviceAccessLoginScreen = true;

      const currentPathname = location.pathname;
      const queryParams = location.search.substring(1);
      sessionStorage.setItem('auth:redirect', currentPathname);
      sessionStorage.setItem('auth:queryParams', queryParams);

      const queryParamsUrl: Params = {};
      queryParams.split('&').forEach((param) => {
        const elements = param.split('=');
        queryParamsUrl[elements[0]] = elements[1];
      });

      return this.router
        .navigate(['service-access'], { queryParams: queryParamsUrl, queryParamsHandling: 'merge' })
        .then();
    } else if (
      location.pathname === '/service-access' ||
      sessionStorage.getItem('baPrincipal') ||
      this.storeService.getProperty('auto_service_access_redirect')
    ) {
      this.serviceAccess = true;
      this.serviceAccessLoginScreen = true;
      const queryParams = location.search.substring(1);
      sessionStorage.setItem('auth:queryParams', queryParams);
      return Promise.resolve();
    } else if (this.storeService.getProperty('auto_auth_redirect')) {
      if (!localStorage.getItem('mfaProcessed')) {
        localStorage.setItem('routeAuthGuard', window.location.pathname);
      }
      return (
        this.startAuth()
          // start a promise that will never resolve, so the app loading won't finish in case
          // of the auth redirect
          .then(() => new Promise<void>(() => {})) // eslint-disable-line
      );
    } else {
      this.setLoginScreen(true);
      localStorage.setItem('routeAuthGuard', window.location.pathname);
      return void this.router.navigate(['login'], {
        queryParamsHandling: 'merge',
      });
    }
  }

  invalidateServiceAccess(): void {
    // Has to be promise, bc. of ExpressionChangedAfterItHasBeenCheckedError
    timer(0).subscribe(() => {
      this.serviceAccess = false;
      this.setLoginScreen(true);
    });
  }

  private setLoginScreen(shown: boolean): void {
    this.loginScreenShown = shown;
  }

  /**
   * This method serves as a simple check
   * that decides if the page user
   * is accessing is valid.
   *
   * @param path current url path
   * @return true if path is valid, false otherwise
   */
  private isPotentiallyValidPath(path: string): boolean {
    const validPaths = [
      '/home',
      '/organizations',
      '/facilities',
      '/myProfile',
      '/admin',
      '/login',
      '/service-access',
      '/profile',
    ];
    if (path === '/') {
      return true;
    }
    for (const validPath of validPaths) {
      if (path.startsWith(validPath)) {
        return true;
      }
    }

    return false;
  }

  private startRefreshToken(): Promise<boolean> {
    if (this.oauthService.hasValidAccessToken()) {
      this.oauthService.events
        .pipe(
          filter((e: OAuthInfoEvent) => e.type === 'token_expires' && e.info === 'access_token')
        )
        .subscribe(() => {
          void this.oauthService.refreshToken();
        });
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  /**
   * Tries to refresh access token if refresh token is present,
   * if successful, sign-in is not required
   */
  private tryRefreshToken(): Promise<void> {
    if (localStorage.getItem('refresh_token') && !this.oauthService.hasValidAccessToken()) {
      return this.oauthService
        .refreshToken()
        .then(() => Promise.resolve())
        .catch(() => Promise.resolve());
    } else {
      return Promise.resolve();
    }
  }

  private redirectToOriginDestination(): Promise<boolean> {
    const mfaRoute = sessionStorage.getItem('mfa_route');
    if (mfaRoute) {
      return this.router.navigate([mfaRoute], { replaceUrl: true, queryParamsHandling: 'merge' });
    }

    let redirectUrl = sessionStorage.getItem('auth:redirect');
    if (!redirectUrl || redirectUrl === '/login') {
      redirectUrl = '/';
    }
    sessionStorage.removeItem('auth:redirect');

    const storageParams = sessionStorage.getItem('auth:queryParams');
    let params: string[] = [];
    if (storageParams) {
      params = storageParams.split('&');
    }
    const queryParams: Params = {};
    params.forEach((param) => {
      const elements = param.split('=');
      queryParams[elements[0]] = elements[1];
    });
    sessionStorage.removeItem('auth:queryParams');

    return this.router.navigate([redirectUrl], {
      queryParams: queryParams,
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  }

  private startAuth(): Promise<void> {
    this.authService.startAuthentication();
    return Promise.resolve();
  }
}
