import { Injectable, Injector } from '@angular/core';
import { filter } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { StoreService } from './store.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { parseQueryParams } from '@perun-web-apps/perun/utils';
import { OidcClient } from '@perun-web-apps/perun/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  filterShortname: string;
  logoutProcess: boolean;
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

  loadOidcConfigData(): void {
    this.oauthService.configure(this.getClientConfig());
  }

  logout(): void {
    if (sessionStorage.getItem('baPrincipal')) {
      sessionStorage.removeItem('baPrincipal');
      sessionStorage.removeItem('basicUsername');
      sessionStorage.removeItem('basicPassword');
      sessionStorage.setItem('baLogout', 'true');
      sessionStorage.setItem('baAfterLogout', 'true');
      void this.router.navigate(['/service-access'], { queryParamsHandling: 'preserve' });
    } else {
      this.logoutProcess = true;
      this.oauthService.logOut();

      const postLogoutUrl = this.store.getProperty('oidc_client').oauth_post_logout_redirect_uri;
      if (!postLogoutUrl) {
        // redirect to the login page if there is no postLogoutUrl
        void this.router.navigate(['/login'], { queryParamsHandling: 'preserve' });
      } else if (this.store.getProperty('proxy_logout')) {
        // redirect to the logout loading page if postLogoutUrl exist and logout should be handled by proxy
        void this.router.navigate(['/logout'], { queryParamsHandling: 'preserve' });
      } else {
        // directly redirect if postLogoutUrl exist and logout should be handled locally (not by proxy)
        window.open(postLogoutUrl, '_self');
      }
    }
  }

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  isLogoutProcess(): boolean {
    return this.logoutProcess;
  }

  setLogoutProcess(logoutProcess: boolean): void {
    this.logoutProcess = logoutProcess;
  }

  getAuthorizationHeaderValue(): string {
    return this.oauthService.hasValidAccessToken()
      ? 'Bearer ' + this.oauthService.getAccessToken()
      : '';
  }

  startAuthentication(): void {
    void this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  getIdpFilter(): string {
    return this.filterShortname;
  }

  private getClientConfig(): AuthConfig {
    const filterValue = this.setIdpFilter();

    //The window of time (in seconds) to allow the current time to deviate when validating
    // id_token's iat and exp values. Default value is 10 minutes. This set it up to 1 sec.
    const clockSkewInSec = 1;
    const randomSalt = Math.random() * 0.25;
    //Defines when the token_timeout event should be raised.
    //Expiration of tokens was moved from 0.75(default) to random number from 0.5 to 0.75
    //So the refreshing of the token is not triggered by multiple tabs at the same time
    const timeoutFactor = 0.5 + randomSalt;

    const oidcClientProperties: OidcClient = this.store.getProperty('oidc_client');
    const acr = oidcClientProperties.oauth_acr_value;
    const customQueryParams = !filterValue
      ? { acr_values: acr }
      : { acr_values: filterValue + ' ' + acr };
    if (
      oidcClientProperties.oauth_scopes.split(' ').includes('offline_access') &&
      oidcClientProperties.oauth_offline_access_consent_prompt
    ) {
      customQueryParams['prompt'] = 'consent';
    }
    if (sessionStorage.getItem('mfa_route') || localStorage.getItem('mfaProcessed')) {
      customQueryParams['acr_values'] = 'https://refeds.org/profile/mfa';
    }
    if (sessionStorage.getItem('mfa_route') || localStorage.getItem('mfaTimeout')) {
      // mfaTimeout = force new authentication if mfaTimeoutError is thrown by Perun
      if (customQueryParams['prompt']) {
        customQueryParams['prompt'] += ' login';
      } else {
        customQueryParams['prompt'] = 'login';
      }
      customQueryParams['max_age'] = '0';
    }
    if (this.store.getProperty('application') === 'Linker') {
      if (customQueryParams['prompt']) {
        customQueryParams['prompt'] += ' login';
      } else {
        customQueryParams['prompt'] = 'login';
      }
      const selectedIdP = parseQueryParams('idphint', location.search.substring(1));
      if (selectedIdP) {
        customQueryParams['idphint'] = selectedIdP;
      }
    }
    return {
      requestAccessToken: true,
      issuer: oidcClientProperties.oauth_authority,
      clientId: oidcClientProperties.oauth_client_id,
      redirectUri: oidcClientProperties.oauth_redirect_uri,
      postLogoutRedirectUri: oidcClientProperties.oauth_post_logout_redirect_uri,
      responseType: oidcClientProperties.oauth_response_type,
      scope: oidcClientProperties.oauth_scopes,
      clockSkewInSec: clockSkewInSec,
      timeoutFactor: timeoutFactor,
      userinfoEndpoint: this.store.getProperty('oidc_client').user_info_endpoint_url,
      customQueryParams: customQueryParams,
    };
  }

  private setIdpFilter(): string {
    const queryParams = location.search.length ? location.search.substring(1).split('&') : [];

    this.filterShortname = null;
    const filters: Record<string, string> = this.store.getProperty('oidc_client').filters;
    if (!filters) {
      return null;
    }
    let filterValue: string = null;
    queryParams.forEach((param) => {
      const parsedParam: string[] = param.split('=');
      if (parsedParam[0] === 'idpFilter') {
        if (filters[parsedParam[1]]) {
          this.filterShortname = parsedParam[1];
          filterValue = filters[parsedParam[1]];
        }
      }
    });
    if (filters['default'] && !filterValue) {
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
}
