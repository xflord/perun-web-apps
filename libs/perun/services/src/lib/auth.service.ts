import { Injectable, Injector } from '@angular/core';
import { filter} from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { StoreService } from './store.service';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpirationDialogComponent } from '@perun-web-apps/perun/session-expiration';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
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

    this.route.queryParams.subscribe(params => {
      if (params["idpFilter"]) {
        this.filterShortname = params["idpFilter"];
      }
    });
  }
  loggedIn = false;
  filterShortname: string;

  redirectUrl: string;

  getClientConfig(): AuthConfig {
    const filterValue = this.setIdpFilter();
    return {
      requestAccessToken: true,
      issuer: this.store.get('oidc_client', 'oauth_authority'),
      clientId: this.store.get('oidc_client', 'oauth_client_id'),
      redirectUri: this.store.get('oidc_client', 'oauth_redirect_uri'),
      postLogoutRedirectUri: this.store.get('oidc_client', 'oauth_post_logout_redirect_uri'),
      responseType: this.store.get('oidc_client', 'oauth_response_type'),
      scope: this.store.get('oidc_client', 'oauth_scopes'),
      useSilentRefresh: false,
      // sessionChecksEnabled: true,
      customQueryParams: !filterValue ? {} : { 'acr_values': filterValue}
    };
  }

  setIdpFilter(): string {
    const queryParams = location.search.substr(1).split('&');
    this.filterShortname = null;
    const filters = this.store.get('oidc_client', 'filters');
    if (!filters) {
      return null;
    }
    let filterValue = null;
    queryParams.forEach(param => {
      const parsedParam = param.split('=')
      if(parsedParam[0] === 'idpFilter') {
        if (filters[parsedParam[1]]) {
          this.filterShortname = parsedParam[1];
          filterValue = filters[parsedParam[1]];
        }
      }
    })
    if(filters['default'] && !filterValue) {
      this.filterShortname = 'default';
      return filters['default'];
    }
    return filterValue;
  }

  /**
   * Subscribes to route events and keeps the idpFilter query parameter.
   *
   * @private
   */
  private startIdpFilterKeeper(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const idpFilterParams: Params = { idpFilter: this.getIdpFilter() };
        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: idpFilterParams.idpFilter === 'default' ? {} : idpFilterParams,
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
      });
  }

  loadConfigData() {
    this.oauthService.configure(this.getClientConfig());
    this.oauthService.events.pipe(filter(e => e.type === 'token_expires')).subscribe(() => {
      const config = getDefaultDialogConfig();
      config.width = '450px';

      const dialogRef = this.dialog.open(SessionExpirationDialogComponent, config);

      dialogRef.afterClosed().subscribe(() => {
        this.startAuthentication();
      });
    });
  }

  verifyAuth(): Promise<boolean> {
    const currentPathname = location.pathname;
    const queryParams = location.search.substr(1);

    if (currentPathname === '/api-callback') {
      return this.handleAuthCallback()
        .then(() => this.redirectToOriginDestination())
    } else {
      return this.verifyAuthentication(currentPathname, queryParams);
    }
  }

  logout() {
    if (sessionStorage.getItem("baPrincipal")) {
      sessionStorage.removeItem("baPrincipal");
      sessionStorage.removeItem("basicUsername");
      sessionStorage.removeItem("basicPassword");
      sessionStorage.setItem("baLogout", "true");
      this.router.navigate(['/service-access']);
    } else {
      this.oauthService.logOut();
    }
  }

  isLoggedInPromise(): Promise<boolean> {
    return this.isLoggedIn() ? Promise.resolve(true) : Promise.resolve(false);
  }

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  getAuthorizationHeaderValue(): string {
    return this.oauthService.hasValidAccessToken() ? 'Bearer ' + this.oauthService.getAccessToken() : '';
  }

  startAuthentication(): void {
    this.oauthService.loadDiscoveryDocumentAndLogin();
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
    const validPaths = ['/home', '/organizations', '/facilities', '/myProfile', '/admin', '/login', '/service-access', '/profile'];
    if (path === '/'){
      return true;
    }
    for (const validPath of validPaths){
      if (path.startsWith(validPath)) {
        return  true;
      }
    }

    return false;
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
  private verifyAuthentication(path: string, queryParams: string): Promise<any> {
    return this.isLoggedInPromise()
      .then(isLoggedIn => {
        if (!isLoggedIn) {
          if (!this.isPotentiallyValidPath(path)) {
            return new Promise<boolean>((resolve, reject) => reject("Invalid path"));
          }

          sessionStorage.setItem('auth:redirect', path);
          sessionStorage.setItem('auth:queryParams', queryParams);

          return false;
        }
        return true;
      });
  }

  /**
   * This method is used to handle oauth callbacks.
   *
   * First, it finishes the authentication and then redirects user to the url
   * he wanted to visit.
   *
   */
  public handleAuthCallback(): Promise<boolean> {
    return this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  public redirectToOriginDestination(): Promise<boolean> {
    const mfaRoute = sessionStorage.getItem('mfa_route');
    if (mfaRoute){
      return this.router.navigate([mfaRoute], {replaceUrl: true})
    }
    let redirectUrl = sessionStorage.getItem('auth:redirect');
    const storageParams = sessionStorage.getItem('auth:queryParams');
    let params: string[] = [];
    if (storageParams) {
      params = storageParams.split('&');
    }
    const queryParams: Params = {};
    params.forEach(param => {
      const elements = param.split('=');
      queryParams[elements[0]] = elements[1];
    })
    if (!redirectUrl || redirectUrl === '/login') {
      redirectUrl = '/';
    }
    sessionStorage.removeItem('auth:redirect');
    sessionStorage.removeItem('auth:queryParams');

    if (queryParams['idpFilter']) {
      this.filterShortname = queryParams['idpFilter'];
    }
    return this.router.navigate([redirectUrl], {queryParams: queryParams, replaceUrl: true});
  }

  public getIdpFilter(): string {
    return this.filterShortname;
  }
}
