/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/explicit-module-boundary-types,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-assignment */

import { Component, OnInit, ViewChild } from '@angular/core';
import { now } from 'moment-timezone';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { AuthService, MfaApiService, StoreService } from '@perun-web-apps/perun/services';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-mfa-settings',
  templateUrl: './mfa-settings.component.html',
  styleUrls: ['./mfa-settings.component.scss'],
})
export class MfaSettingsComponent implements OnInit {
  @ViewChild('toggle') toggle: MatSlideToggle;

  mfaAvailable = false;
  loadingMfa = false;

  enforceMfa: boolean;
  showDetail = false;
  loadingCategories = false;
  includeCategories: string[] = [];
  excludeRps: string[] = [];
  allCategories = false;
  unchangedSettings = true;
  unchangedEnforce = true;

  categories = {};

  constructor(
    public translate: TranslateService,
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private oauthService: OAuthService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private mfaApiService: MfaApiService
  ) {}

  ngOnInit(): void {
    this.loadingMfa = true;
    this.mfaApiService.isMfaAvailable().subscribe(
      (isAvailable) => {
        this.mfaAvailable = isAvailable;
        if (isAvailable) {
          this.loadMfa();
        } else {
          this.loadingMfa = false;
        }
      },
      (err) => {
        console.error(err);
        this.loadingMfa = false;
      }
    );
  }

  /**
   * If mfa_route has value in the session storage, it means that application was reloaded
   * and now the application should finish some PUT action which requires valid id token
   */
  loadMfa(): void {
    const mfaRoute = sessionStorage.getItem('mfa_route');
    if (mfaRoute) {
      const enforceMfa = sessionStorage.getItem('enforce_mfa');
      if (enforceMfa) {
        this.changeEnforceMfa(enforceMfa === 'true');
      }

      const settingsMfa = sessionStorage.getItem('settings_mfa');
      if (settingsMfa) {
        this.updateDetailSettings();
      }
    } else {
      // load enforce_mfa from attribute
      const enforceMfaAttributeName = this.store.get('mfa', 'enforce_mfa_attribute') as string;
      this.attributesManagerService
        .getUserAttributeByName(this.store.getPerunPrincipal().userId, enforceMfaAttributeName)
        .subscribe(
          (attr) => {
            if (attr.value) {
              this.enforceMfa = true;
              this.toggle.toggle();
            } else {
              this.enforceMfa = false;
            }
            this.loadingMfa = false;
          },
          (e) => {
            console.error(e);
            this.loadingMfa = false;
          }
        );
    }
  }

  /**
   * This method loads all available categories from the mfa api and current settings
   */
  getCategoriesAndSettings(): void {
    this.loadingCategories = true;
    this.mfaApiService.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
        this.getSettings();
      },
      (err) => {
        console.error(err);
        this.loadingCategories = false;
      }
    );
  }

  /**
   * This method loads current categories/rps mfa settings
   */
  getSettings(): void {
    if (!this.unchangedEnforce) {
      // if enforce mfa for all services is changed before categories and settings are loaded
      this.includeCategories = [];
      this.allCategories = this.toggle.checked;
      this.setValuesFromSetting();
      this.showDetail = !this.showDetail;
      this.loadingCategories = false;
    } else {
      this.mfaApiService.getSettings().subscribe(
        (settings) => {
          if (settings.length !== 0) {
            if (settings.all) {
              this.allCategories = true;
            } else {
              this.includeCategories = settings['include_categories']
                ? settings['include_categories']
                : [];
              this.excludeRps = settings['exclude_rps'] ? settings['exclude_rps'] : [];
            }
          }
          this.setValuesFromSetting();
          this.showDetail = !this.showDetail;
          this.loadingCategories = false;
        },
        (err) => {
          console.error(err);
          this.loadingCategories = false;
        }
      );
    }
  }

  /**
   * Sets values for mfa api to object - these values in object are represented by toggles
   */
  setValuesFromSetting(): void {
    if (this.includeCategories.length === 0) {
      // for all categories and for no category in the settings
      const value = this.allCategories;
      for (const category in this.categories) {
        this.categories[category].value = value;
        this.categories[category].show = false; // if the sub toggles are showed in GUI or not
        this.categories[category].rps_value = {};
        for (const service in this.categories[category].rps) {
          this.categories[category].rps_value[service] = value;
        }
      }
    } else {
      // for some included categories with some excluded rps
      for (const category in this.categories) {
        this.categories[category].value = this.includeCategories.includes(category);
        this.categories[category].show = false;
        this.categories[category].rps_value = {};
        for (const rps in this.categories[category].rps) {
          this.categories[category].rps_value[rps] = this.categories[category].value
            ? !this.excludeRps.includes(rps)
            : false;
        }
      }
    }
  }

  /**
   * Shows all categories and services (rps) and allow to change their values
   * If user clicks on more detail button (arrow button) first time, this method will load all categories and settings
   */
  showDetailSettings(): void {
    if (!this.showDetail && Object.keys(this.categories).length === 0) {
      this.getCategoriesAndSettings();
    } else {
      this.showDetail = !this.showDetail;
    }
  }

  toggleEnableMfa(): void {
    this.unchangedEnforce = false;
    this.includeCategories = [];
    this.allCategories = !this.toggle.checked;
    this.setValuesFromSetting();
  }

  toggleCategory(categoryValue: any, skipServices = false): void {
    this.unchangedSettings = false;
    // deselect toggle mfa for all categories
    if (this.checkAllCategoriesSelected() && this.toggle.checked && !skipServices) {
      this.toggle.toggle();
    }

    categoryValue.value = !categoryValue.value;
    if (!skipServices) {
      for (const rps in categoryValue.rps_value) {
        categoryValue.rps_value[rps] = categoryValue.value;
      }
    }

    // select toggle mfa for all categories
    if (this.checkAllCategoriesSelected() && !this.toggle.checked && !skipServices) {
      this.toggle.toggle();
    }
  }

  checkAllCategoriesSelected(): boolean {
    let allTrueCheck = true;
    for (const category in this.categories) {
      if (!this.categories[category].value) {
        allTrueCheck = false;
      }
    }
    return allTrueCheck;
  }

  toggleRps(category: any, rps: any): void {
    rps = String(rps);
    this.unchangedSettings = false;
    // select toggle mfa for category
    if (this.checkAllRpsDeselectedForCategory(String(category.key))) {
      this.toggleCategory(category.value, true);
    }

    // deselect toggle mfa for all categories
    if (this.checkAllRpsSelected()) {
      this.toggle.toggle();
    }

    category.value['rps_value'][rps] = !category.value['rps_value'][rps];

    // deselect toggle mfa for category
    if (this.checkAllRpsDeselectedForCategory(String(category.key))) {
      this.toggleCategory(category.value, true);
    }

    // select toggle mfa for all categories
    if (this.checkAllRpsSelected()) {
      this.toggle.toggle();
    }
  }

  checkAllRpsDeselectedForCategory(category: string): boolean {
    let allFalseCheck = true;
    for (const rps in this.categories[category]['rps']) {
      if (this.categories[category].rps_value[rps]) {
        allFalseCheck = false;
      }
    }
    return allFalseCheck;
  }

  checkAllRpsSelected(): boolean {
    let allTrueCheck = true;

    for (const category in this.categories) {
      if (!this.categories[category].value) {
        return false;
      }
      for (const rps in this.categories[category]['rps']) {
        if (!this.categories[category].rps_value[rps]) {
          allTrueCheck = false;
        }
      }
    }

    return allTrueCheck;
  }

  /**
   * This method fires logic for setting new values of enforceMfa and settings
   */
  saveSettings(enforceFirstMfa = false): void {
    if (this.oauthService.getIdTokenExpiration() - now() > 0 && !enforceFirstMfa) {
      if (this.enforceMfa !== this.toggle.checked) {
        this.loadingMfa = true;
        this.changeEnforceMfa(this.toggle.checked);
      }
      if (!this.unchangedSettings) {
        this.loadingMfa = true;
        this.saveDetailSettings();
        this.updateDetailSettings();
      }
    } else {
      this.saveEnforceMfa();
      if (!this.unchangedSettings) {
        this.saveDetailSettings();
      }
      this.reAuthenticate();
    }
  }

  saveEnforceMfa(): void {
    if (this.enforceMfa !== this.toggle.checked) {
      sessionStorage.setItem('enforce_mfa', this.toggle.checked.toString());
    }
  }

  /**
   * This method creates request body for new settings according to toggles
   */
  saveDetailSettings(): void {
    let allTrueCheck = true;
    let allFalseCheck = false;
    this.includeCategories = [];
    this.excludeRps = [];

    for (const category in this.categories) {
      if (this.categories[category].value) {
        allFalseCheck = true;
        this.includeCategories.push(category);
      } else {
        allTrueCheck = false;
        continue;
      }
      for (const rps in this.categories[category]['rps']) {
        if (this.categories[category].rps_value[rps]) {
          allFalseCheck = true;
        } else {
          allTrueCheck = false;
          this.excludeRps.push(rps);
        }
      }
    }

    let body: string;

    if (allTrueCheck === allFalseCheck) {
      if (allTrueCheck) {
        body = JSON.stringify({ all: true });
      } else {
        body = '{}';
      }
    } else {
      body = JSON.stringify({
        include_categories: this.includeCategories,
        exclude_rps: this.excludeRps,
      });
    }

    sessionStorage.setItem('settings_mfa', body);
  }

  /**
   * This method is used when we want to do some PUT operation, but we need new (not expired) id token
   */
  reAuthenticate(): void {
    sessionStorage.setItem('mfa_route', '/profile/settings/auth');
    this.oauthService.logOut(true);
    sessionStorage.setItem('auth:redirect', location.pathname);
    sessionStorage.setItem('auth:queryParams', location.search.substring(1));
    this.authService.loadConfigData();
    void this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  /**
   * This method turns on/off enforceMfa flag
   * @param enforceMfa turn on/off mfa for all services according to toggle
   */
  changeEnforceMfa(enforceMfa: boolean): void {
    this.mfaApiService.enforceMfaForAllServices(enforceMfa).subscribe(
      () => {
        if (enforceMfa) {
          this.enforceMfa = true;
          if (!this.toggle.checked) {
            this.toggle.toggle();
          }
        } else {
          this.enforceMfa = false;
        }
        this.unchangedSettings = true;
        this.unchangedEnforce = true;
        sessionStorage.removeItem('enforce_mfa');
        sessionStorage.removeItem('mfa_route');
        this.loadingMfa = false;
      },
      (err) => {
        // when token is valid, but user is logged in without MFA -> enforce MFA
        if (err.error.error === 'MFA is required') {
          this.saveSettings(true);
        }
      }
    );
  }

  /**
   * This method updates settings of enforced mfa for categories and services
   */
  updateDetailSettings(): void {
    const body = sessionStorage.getItem('settings_mfa');

    this.mfaApiService.updateDetailSettings(body).subscribe(
      () => {
        this.unchangedSettings = true;
        this.unchangedEnforce = true;
        sessionStorage.removeItem('settings_mfa');
        sessionStorage.removeItem('mfa_route');
        this.loadingMfa = false;
      },
      (err) => {
        // when token is valid, but user is logged in without MFA -> enforce MFA
        if (err.error.error === 'MFA is required') {
          this.saveSettings(true);
        }
      }
    );
  }
}
