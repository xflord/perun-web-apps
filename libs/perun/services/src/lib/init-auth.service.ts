import { Injectable } from '@angular/core';
// eslint-disable-next-line
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { GuiAuthResolver } from './gui-auth-resolver.service';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { UserDontExistDialogComponent } from '@perun-web-apps/general';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class InitAuthService {
  private loginScreenShown = false;
  private serviceAccess = false;
  private serviceAccessLoginScreen = false;
  constructor(
    private authService: AuthService,
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
   * Load additional data. First it init authService with necessarily data, then
   * start authentication.
   */
  verifyAuth(): Promise<boolean> {
    if (sessionStorage.getItem('baPrincipal')) {
      this.serviceAccess = true;
      if (location.pathname === '/service-access') {
        return this.router.navigate([]).then(() => true);
      } else {
        return this.router.navigate([location.pathname]).then(() => true);
      }
    }

    this.authService.loadConfigData();

    if (this.storeService.skipOidc()) {
      return new Promise<boolean>((resolve) => resolve(true));
    } else {
      return this.authService.verifyAuth();
    }
  }

  startAuth(): Promise<void> {
    this.authService.startAuthentication();
    return Promise.resolve();
  }

  /**
   * Load principal
   */
  loadPrincipal(): Promise<void> {
    return this.authzService
      .getPerunPrincipal()
      .toPromise()
      .then((perunPrincipal) => {
        if (perunPrincipal.user === null) {
          const config = getDefaultDialogConfig();
          this.dialog.open(UserDontExistDialogComponent, config);
        } else {
          this.storeService.setPerunPrincipal(perunPrincipal);
          this.authResolver.init(perunPrincipal);
          const previousUrl = localStorage.getItem('routeAuthGuard');
          if (previousUrl) {
            localStorage.removeItem('routeAuthGuard');
            void this.router.navigate([previousUrl]);
          }
        }
      });
  }

  /**
   * Handles the auth start. If the configuration property `auto_auth_redirect`
   * is set to true, a rediret to the oidc server will be made.
   * If the property is set to false, a redirect to local page /login will be
   * made.
   */
  handleAuthStart(): Promise<void> {
    if (location.pathname === '/service-access' || sessionStorage.getItem('baPrincipal')) {
      this.serviceAccess = true;
      this.serviceAccessLoginScreen = true;
      return new Promise<void>((resolve) => {
        resolve();
      });
    } else if (this.storeService.get('auto_auth_redirect')) {
      localStorage.setItem('routeAuthGuard', window.location.pathname);
      return (
        this.startAuth()
          // start a promise that will never resolve, so the app loading won't finish in case
          // of the auth redirect
          .then(() => new Promise<void>(() => {})) // eslint-disable-line
      );
    } else {
      this.setLoginScreen(true);
      localStorage.setItem('routeAuthGuard', window.location.pathname);
      const query = location.search.substr(1).split('&');
      const queryParams = {};
      for (const param of query) {
        const p = param.split('=');
        queryParams[p[0]] = p[1];
      }
      return void this.router.navigate(['login'], {
        queryParams: queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }
}
