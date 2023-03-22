/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/explicit-module-boundary-types,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-assignment */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { now } from 'moment-timezone';
import { StoreService } from './store.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { MfaSettings } from '@perun-web-apps/perun/models';
import { AuthService } from './auth.service';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';

@Injectable({
  providedIn: 'root',
})
export class MfaApiService {
  mfaApiUrl = this.store.getProperty('mfa').api_url;
  constructor(
    private store: StoreService,
    private oauthService: OAuthService,
    private httpClient: HttpClient,
    private authService: AuthService,
    private attributesManagerService: AttributesManagerService
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
   * This method loads the available categories and their labels from
   * the mfaCategories attribute and then loads current categories/rps settings
   * There are three types of settings responses, which you can get from mfa api:
   *    - If all categories and all services (rps) requires mfa
   *        -> { "all": true }
   *    - If no category (it means also no rps) require mfa
   *        -> []
   *    - Some categories/services (rps) require mfa
   *        -> {"include_categories": ["category1"]}
   *        -> {"include_categories": ["category1"], "exclude_rps": ["rps1"]}
   */
  getSettings(): Observable<MfaSettings> {
    const result: MfaSettings = {
      categories: {},
      includedCategories: [],
      excludedRps: [],
      includedRpsByCategory: new Map(),
      rpsByCategory: new Map(),
    };
    return new Observable<MfaSettings>((res) => {
      this.attributesManagerService
        .getEntitylessAttributeByName(
          'categories',
          'urn:perun:entityless:attribute-def:def:mfaCategories'
        )
        .subscribe({
          next: (categories) => {
            result.categories = JSON.parse(String(categories.value));
            for (const category in result.categories) {
              result.rpsByCategory[category] = result.categories[category].rps;
            }
            this.httpClient
              .get<any>(this.mfaApiUrl + 'settings', {
                headers: { Authorization: 'Bearer ' + this.oauthService.getAccessToken() },
              })
              .subscribe({
                next: (settings) => {
                  if (settings.length !== 0) {
                    if (settings.all) {
                      result.includedCategories = Object.keys(result.categories);
                      for (const category in result.categories) {
                        result.includedRpsByCategory[category] = Object.keys(
                          result.categories[category].rps as object
                        );
                      }
                    } else {
                      result.includedCategories = settings['include_categories']
                        ? settings['include_categories']
                        : [];
                      result.excludedRps = settings['exclude_rps'] ? settings['exclude_rps'] : [];
                      for (const category in result.categories) {
                        const includedRpsList = [];
                        if (result.includedCategories.includes(category)) {
                          // only makes sense to get rps for included categories
                          for (const rps in result.categories[category].rps) {
                            if (!result.excludedRps.includes(rps)) {
                              includedRpsList.push(rps);
                            }
                          }
                        }
                        result.includedRpsByCategory[category] = includedRpsList;
                      }
                    }
                  }
                  res.next(result);
                },
                error: (err) => {
                  console.error(err);
                  res.error(err);
                },
              });
          },
          error: (err) => {
            res.error(err);
          },
        });
    });
  }

  /**
   * This method creates request body for new settings according to toggles
   */
  saveDetailSettings(settings: MfaSettings): void {
    let allTrue = false;
    let allFalse = true;

    if (
      settings.includedCategories.length === Object.keys(settings.categories).length &&
      settings.excludedRps.length === 0
    ) {
      allTrue = true;
    }

    if (settings.includedCategories.length > 0) {
      allFalse = false;
    }

    let body: string;

    if (allTrue) {
      body = JSON.stringify({ all: true });
    } else if (allFalse) {
      body = '{}';
    } else {
      body = JSON.stringify({
        include_categories: settings.includedCategories,
        exclude_rps: settings.excludedRps,
      });
    }
    sessionStorage.setItem('settings_mfa', body);
  }

  changeEnforceMfa(enforceMfa: boolean): Observable<any> {
    const body = `value=${String(enforceMfa)}`;
    return new Observable<any>((res) => {
      this.httpClient
        .put(this.mfaApiUrl + 'mfaEnforced', body, {
          headers: { Authorization: 'Bearer ' + this.oauthService.getAccessToken() },
        })
        .subscribe({
          next: () => {
            sessionStorage.removeItem('enforce_mfa');
            sessionStorage.removeItem('mfa_route');
            res.next();
          },
          error: (err) => {
            // when token is valid, but user is logged in without MFA -> enforce MFA
            if (err.error.error === 'MFA is required') {
              this.saveSettings(null, true).subscribe();
            } else {
              res.error(err);
            }
          },
        });
    });
  }

  /**
   * This method fires logic for setting new values of enforceMfa and settings
   */
  saveSettings(newEnforce: boolean, enforceFirstMfa = false): Observable<any> {
    return new Observable<any>((res) => {
      if (this.oauthService.getIdTokenExpiration() - now() > 0 && !enforceFirstMfa) {
        this.changeEnforceMfa(newEnforce).subscribe({
          next: () => {
            this.updateDetailSettings().subscribe({
              next: () => {
                res.next();
              },
              error: (e) => {
                res.error(e);
              },
            });
          },
          error: (e) => {
            res.error(e);
          },
        });
      } else {
        this.reAuthenticate();
      }
    });
  }

  /**
   * This method is used when we want to do some PUT operation, but we need new (not expired) id token
   */
  reAuthenticate(): void {
    sessionStorage.setItem('mfa_route', '/profile/settings/auth');
    this.oauthService.logOut(true);
    sessionStorage.setItem('auth:redirect', location.pathname);
    sessionStorage.setItem('auth:queryParams', location.search.substring(1));
    this.authService.loadOidcConfigData();
    void this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  /**
   * Updates current settings for categories and services
   */
  updateDetailSettings(): Observable<any> {
    const body = sessionStorage.getItem('settings_mfa');
    return new Observable<any>((res) => {
      this.httpClient
        .put(this.mfaApiUrl + 'settings', body, {
          headers: {
            Authorization: 'Bearer ' + this.oauthService.getAccessToken(),
            // FIXME: at this time mfa api checks exact match on 'application/json' (without ; at the end)
            'content-type': 'application/json',
          },
        })
        .subscribe({
          next: () => {
            sessionStorage.removeItem('settings_mfa');
            sessionStorage.removeItem('mfa_route');
            res.next();
          },
          error: (err) => {
            // when token is valid, but user is logged in without MFA -> enforce MFA
            if (err.error.error === 'MFA is required') {
              this.saveSettings(null, true).subscribe();
            } else {
              res.error(err);
            }
          },
        });
    });
  }
}
