import { Injectable, Injector } from '@angular/core';
import { filter } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { StoreService } from './store.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthConfig, OAuthInfoEvent, OAuthService } from 'angular-oauth2-oidc';
import { parseQueryParams } from '@perun-web-apps/perun/utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedIn = false;
  filterShortname: string;
  redirectUrl: string;
  private router: Router;

  constructor(
    private injector: Injector,
    private store: StoreService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private oauthService: OAuthService
  ) {
    setTimeout(() => {
      this.router = this.injector.get(Router);

      this.startIdpFilterKeeper();
    });

    this.route.queryParams.subscribe((params) => {
      if (params['idpFilter']) {
        this.filterShortname = String(params['idpFilter']);
      }
    });
  }

  getClientConfig(): AuthConfig {
    const filterValue = this.setIdpFilter();

    //The window of time (in seconds) to allow the current time to deviate when validating
    // id_token's iat and exp values. Default value is 10 minutes. This set it up to 1 sec.
    const clockSkewInSec = 1;
    const randomSalt = Math.random() * 0.25;
    //Defines when the token_timeout event should be raised.
    //Expiration of tokens was moved from 0.75(default) to random number from 0.5 to 0.75
    //So the refreshing of the token is not triggered by multiple tabs at the same time
    const timeoutFactor = 0.5 + randomSalt;

    const customQueryParams = !filterValue ? {} : { acr_values: filterValue };

    if (
      (this.store.get('oidc_client', 'oauth_scopes') as string)
        .split(' ')
        .includes('offline_access') &&
      this.store.get('oidc_client', 'oauth_offline_access_consent_prompt')
    ) {
      customQueryParams['prompt'] = 'consent';
    }
    if (sessionStorage.getItem('mfa_route')) {
      customQueryParams['acr_values'] = 'https://refeds.org/profile/mfa';
      customQueryParams['prompt'] = 'login';
      customQueryParams['max_age'] = '0';
    }
    if (this.store.getProperty('application') === 'Linker') {
      customQueryParams['prompt'] = 'login';
      const selectedIdP = parseQueryParams('idphint', location.search.substring(1));
      if (selectedIdP) {
        customQueryParams['idphint'] = selectedIdP;
      }
    }
    return {
      requestAccessToken: true,
      issuer: this.store.get('oidc_client', 'oauth_authority') as string,
      clientId: this.store.get('oidc_client', 'oauth_client_id') as string,
      redirectUri: this.store.get('oidc_client', 'oauth_redirect_uri') as string,
      postLogoutRedirectUri: this.store.get(
        'oidc_client',
        'oauth_post_logout_redirect_uri'
      ) as string,
      responseType: this.store.get('oidc_client', 'oauth_response_type') as string,
      scope: this.store.get('oidc_client', 'oauth_scopes') as string,
      clockSkewInSec: clockSkewInSec,
      timeoutFactor: timeoutFactor,
      userinfoEndpoint: this.store.getProperty('oidc_client').user_info_endpoint_url,
      customQueryParams: customQueryParams,
    };
  }

  setIdpFilter(): string {
    const queryParams = location.search.substring(1).split('&');
    this.filterShortname = null;
    const filters: Map<string, string> = this.store.get('oidc_client', 'filters') as Map<
      string,
      string
    >;
    if (!filters) {
      return null;
    }
    let filterValue: string = null;
    queryParams.forEach((param) => {
      const parsedParam: string[] = param.split('=');
      if (parsedParam[0] === 'idpFilter') {
        if (filters[parsedParam[1]]) {
          this.filterShortname = parsedParam[1];
          filterValue = filters[parsedParam[1]] as string;
        }
      }
    });
    if (filters['default'] && !filterValue) {
      this.filterShortname = 'default';
      return filters['default'] as string;
    }
    return filterValue;
  }

  loadConfigData(): void {
    this.oauthService.configure(this.getClientConfig());
  }

  verifyAuth(): Promise<boolean> {
    const currentPathname = location.pathname;
    const queryParams = location.search.substring(1);

    if (currentPathname === '/api-callback') {
      return this.handleAuthCallback()
        .then(() => this.startRefreshToken())
        .then(() => this.redirectToOriginDestination());
    } else {
      return this.verifyAuthentication(currentPathname, queryParams).then((isVerified) => {
        if (isVerified) {
          return this.startRefreshToken();
        } else {
          return new Promise<boolean>((resolve) => resolve(false));
        }
      });
    }
  }

  startRefreshToken(): Promise<boolean> {
    return this.isLoggedInPromise().then((isLoggedIn) => {
      if (isLoggedIn) {
        this.oauthService.events
          .pipe(
            filter((e: OAuthInfoEvent) => e.type === 'token_expires' && e.info === 'access_token')
          )
          .subscribe(() => {
            void this.refreshAndStoreToken();
          });
        return true;
      }
      return false;
    });
  }

  logout(): void {
    if (sessionStorage.getItem('baPrincipal')) {
      sessionStorage.removeItem('baPrincipal');
      sessionStorage.removeItem('basicUsername');
      sessionStorage.removeItem('basicPassword');
      sessionStorage.setItem('baLogout', 'true');
      void this.router.navigate(['/service-access']);
    } else {
      localStorage.removeItem('refresh_token');
      this.oauthService.logOut();
    }
  }

  isLoggedInPromise(): Promise<boolean> {
    return Promise.resolve(this.isLoggedIn());
  }

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  getAuthorizationHeaderValue(): string {
    return this.oauthService.hasValidAccessToken()
      ? 'Bearer ' + this.oauthService.getAccessToken()
      : '';
  }

  startAuthentication(): void {
    void this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  /**
   * This method is used to handle oauth callbacks.
   *
   * First, it finishes the authentication and then redirects user to the url
   * he wanted to visit.
   *
   */
  handleAuthCallback(): Promise<boolean> {
    return this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  redirectToOriginDestination(): Promise<boolean> {
    const mfaRoute = sessionStorage.getItem('mfa_route');
    if (mfaRoute) {
      return this.router.navigate([mfaRoute], { replaceUrl: true });
    }
    let redirectUrl = sessionStorage.getItem('auth:redirect');
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
    if (!redirectUrl || redirectUrl === '/login') {
      redirectUrl = '/';
    }
    sessionStorage.removeItem('auth:redirect');
    sessionStorage.removeItem('auth:queryParams');

    if (queryParams['idpFilter']) {
      this.filterShortname = String(queryParams['idpFilter']);
    }
    return this.router.navigate([redirectUrl], { queryParams: queryParams, replaceUrl: true });
  }

  getIdpFilter(): string {
    return this.filterShortname;
  }

  /**
   * Subscribes to route events and keeps the idpFilter query parameter.
   *
   * @private
   */
  private startIdpFilterKeeper(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const idpFilterParams: Params = { idpFilter: this.getIdpFilter() };
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: idpFilterParams.idpFilter === 'default' ? {} : idpFilterParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
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
    // add '/service-access' to valid paths to enable basic auth
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

  /**
   * Tries to refresh access token if refresh token is present,
   * if successful, sign-in is not required
   */
  private tryRefreshToken(): Promise<void> {
    if (localStorage.getItem('refresh_token') && !this.isLoggedIn()) {
      return this.refreshAndStoreToken()
        .then(() => Promise.resolve())
        .catch(() => Promise.resolve());
    } else {
      return Promise.resolve();
    }
  }

  private refreshAndStoreToken(): Promise<boolean> {
    return this.oauthService.refreshToken().then(
      () => {
        return true;
      },
      () => false
    );
  }

  /**
   * Check if the user is logged in and if not,
   * prevent proxy overload by checking path validity and only then
   * save current path and start authentication;
   *
   * On invalid path doesn't start authentication
   *
   * @param path current url path
   * @param queryParams current url's query parameters
   * @return true if user is logged in, false otherwise and an error
   *         if given path is invalid
   */
  private verifyAuthentication(path: string, queryParams: string): Promise<boolean> {
    return this.oauthService
      .loadDiscoveryDocument()
      .then(() => this.tryRefreshToken())
      .then(() => this.isLoggedInPromise())
      .then((isLoggedIn) => {
        if (this.store.getProperty('application') === 'Linker') {
          sessionStorage.setItem('auth:queryParams', queryParams);
          localStorage.removeItem('access_token');

          return false;
        }
        if (!isLoggedIn) {
          if (!this.isPotentiallyValidPath(path)) {
            return new Promise<boolean>((resolve, reject) => reject('Invalid path'));
          }

          sessionStorage.setItem('auth:redirect', path);
          sessionStorage.setItem('auth:queryParams', queryParams);

          return false;
        }
        return true;
      });
  }
}
