import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { GuiAuthResolver } from './gui-auth-resolver.service';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { UserDontExistDialogComponent } from '@perun-web-apps/general';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { OAuthInfoEvent, OAuthService } from 'angular-oauth2-oidc';
import { firstValueFrom } from 'rxjs';

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
    private router: Router
  ) {}

  setLoginScreen(shown: boolean): void {
    this.loginScreenShown = shown;
  }

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
    if (sessionStorage.getItem('baPrincipal')) {
      this.serviceAccess = true;
      const pathName = location.pathname === '/service-access' ? '' : location.pathname;
      return this.router.navigate([pathName]);
    } else if (location.pathname !== '/service-access') {
      this.authService.loadOidcConfigData();

      const currentPathname = location.pathname;
      const queryParams = location.search.substring(1);

      if (currentPathname === '/api-callback') {
        return this.oauthService
          .loadDiscoveryDocumentAndTryLogin()
          .then(() => this.startRefreshToken())
          .then(() => this.authService.redirectToOriginDestination());
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

            if (!this.authService.isLoggedIn()) {
              if (!this.isPotentiallyValidPath(currentPathname)) {
                return new Promise<boolean>((resolve, reject) => reject('Invalid path'));
              }

              sessionStorage.setItem('auth:redirect', currentPathname);
              sessionStorage.setItem('auth:queryParams', queryParams);

              return false;
            } else {
              this.startRefreshToken();
              return true;
            }
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
      void this.router.navigate([previousUrl]);
    }
  }

  /**
   * Handles the auth start. If the configuration property `auto_auth_redirect`
   * is set to true, a redirect to the oidc server will be made.
   * If the property is set to false, a redirect to local page /login will be
   * made.
   */
  handleAuthStart(): void {
    if (location.pathname === '/service-access' || sessionStorage.getItem('baPrincipal')) {
      this.serviceAccess = true;
      this.serviceAccessLoginScreen = true;
    } else if (this.storeService.getProperty('auto_auth_redirect')) {
      localStorage.setItem('routeAuthGuard', window.location.pathname);
      this.authService.startAuthentication();
    } else {
      this.setLoginScreen(true);
      localStorage.setItem('routeAuthGuard', window.location.pathname);
      void this.router.navigate(['login'], {
        queryParamsHandling: 'merge',
      });
    }
  }

  /**
   *  Set up check whether access token expires, when it does, it gets automatically refreshed (if possible)
   */
  startRefreshToken(): void {
    if (this.oauthService.hasValidAccessToken()) {
      this.oauthService.events
        .pipe(
          filter((e: OAuthInfoEvent) => e.type === 'token_expires' && e.info === 'access_token')
        )
        .subscribe(() => {
          void this.oauthService.refreshToken();
        });
    }
  }

  /**
   * Tries to refresh access token if refresh token is present,
   * if successful, sign-in is not required
   */
  private tryRefreshToken(): Promise<void> {
    if (localStorage.getItem('refresh_token') && !this.authService.isLoggedIn()) {
      return this.oauthService
        .refreshToken()
        .then(() => Promise.resolve())
        .catch(() => Promise.resolve());
    } else {
      return Promise.resolve();
    }
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
      '/profile',
      '/service-access',
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
}
