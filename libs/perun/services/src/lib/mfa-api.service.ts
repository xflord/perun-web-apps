/* eslint-disable
   @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StoreService } from './store.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MfaApiService {
  mfaApiUrl = this.store.getProperty('mfa').api_url;
  constructor(
    private store: StoreService,
    private oauthService: OAuthService,
    private httpClient: HttpClient
  ) {}

  /**
   * Checks if MFA is available for current user (if user has any MFA token)
   */
  isMfaAvailable(): Observable<boolean> {
    return this.httpClient.get<boolean>(this.mfaApiUrl + 'mfaAvailable', {
      headers: { Authorization: 'Bearer ' + this.oauthService.getAccessToken() },
    });
  }

  /**
   * This method loads all available categories from the mfa api
   * NOTE: Each service (rps) belongs to exactly one category.
   * If some service doesn't have some category in Perun, then belongs to universal category "other".
   */
  getCategories(): Observable<any> {
    return this.httpClient.get<any>(this.mfaApiUrl + 'categories', {
      headers: { Authorization: 'Bearer ' + this.oauthService.getAccessToken() },
    });
  }

  /**
   * This method loads current categories/rps settings
   * There are three types of responses, which you can get from mfa api:
   *    - If all categories and all services (rps) requires mfa
   *        -> { "all": true }
   *    - If no category (it means also no rps) require mfa
   *        -> []
   *    - Some categories/services (rps) require mfa
   *        -> {"include_categories": ["category1"]}
   *        -> {"include_categories": ["category1"], "exclude_rps": ["rps1"]}
   */
  getSettings(): Observable<any> {
    return this.httpClient.get<any>(this.mfaApiUrl + 'settings', {
      headers: { Authorization: 'Bearer ' + this.oauthService.getAccessToken() },
    });
  }

  /**
   * Enforce MFA for all services (settings = { "all": true })
   *
   * NOTE for devel: this method will set also attr value of mfaEnforced:mu,
   * but currently we need to test this functionality only with production client_id,
   * so this value will change only on production, not on devel
   * @param value true/false
   */
  enforceMfaForAllServices(value: boolean): Observable<any> {
    const body = `value=${String(value)}`;
    return this.httpClient.put(this.mfaApiUrl + 'mfaEnforced', body, {
      headers: { Authorization: 'Bearer ' + this.oauthService.getAccessToken() },
    });
  }

  /**
   * Updates current settings for categories and services
   * @param body the same asi getSettings() -> 3 types of possible bodies
   */
  updateDetailSettings(body: string): Observable<any> {
    return this.httpClient.put(this.mfaApiUrl + 'settings', body, {
      headers: {
        Authorization: 'Bearer ' + this.oauthService.getAccessToken(),
        // FIXME: at this time mfa api checks exact match on 'application/json' (without ; at the end)
        'content-type': 'application/json',
      },
    });
  }
}
