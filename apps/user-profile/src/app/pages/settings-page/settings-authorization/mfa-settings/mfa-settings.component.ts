/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/explicit-module-boundary-types,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-assignment */

import { Component, OnInit, ViewChild } from '@angular/core';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { AuthService, MfaApiService, StoreService } from '@perun-web-apps/perun/services';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MfaSettings } from '@perun-web-apps/perun/models';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'perun-web-apps-mfa-settings',
  templateUrl: './mfa-settings.component.html',
  styleUrls: ['./mfa-settings.component.scss'],
})
export class MfaSettingsComponent implements OnInit {
  @ViewChild('master') checkbox: MatCheckbox;

  mfaAvailable = false;
  loadingMfa = false;
  errorTooltip = 'AUTHENTICATION.MFA_DISABLED';

  enforceMfa: boolean;
  originalMfa = false;
  enableDetailSettings = true;
  loadingCategories = false;
  unchangedSettings = true;
  categorySelection: SelectionModel<string>;
  rpsSelections: Map<string, SelectionModel<string>> = new Map<string, SelectionModel<string>>();
  allRpsSelected = false;

  categories = {};
  mfaUrl = '';
  settings: MfaSettings;

  // need these because can't call Object.keys in template
  allCategoriesKeys: string[] = [];
  allRpsKeysByCategory: Map<string, string[]> = new Map();

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
    const mfa = this.store.getProperty('mfa');
    this.translate.onLangChange.subscribe(() => {
      this.mfaUrl = this.translate.currentLang === 'en' ? mfa.url_en : mfa.url_cs;
    });

    this.mfaUrl = this.translate.currentLang === 'en' ? mfa.url_en : mfa.url_cs;
    this.categorySelection = new SelectionModel<string>(true, []);
    this.mfaApiService.isMfaAvailable().subscribe({
      next: (isAvailable) => {
        this.mfaAvailable = isAvailable;
        if (this.mfaAvailable) {
          this.loadingCategories = true;
          this.loadMfa();
        } else {
          this.loadingMfa = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.errorTooltip = 'AUTHENTICATION.MFA_ERROR';
        this.loadingMfa = false;
      },
    });
  }

  /**
   * If mfa_route has value in the session storage, it means that application was reloaded
   * and now the application should finish some PUT action which requires valid id token
   */
  loadMfa(): void {
    const mfaRoute = sessionStorage.getItem('mfa_route');
    if (mfaRoute) {
      const enforceMfa = sessionStorage.getItem('enforce_mfa');
      // This should propagate unfinished PUT action
      if (enforceMfa) {
        const body = JSON.stringify({ all: enforceMfa === 'true' });
        sessionStorage.setItem('settings_mfa', body);
      }
      const settingsMfa = sessionStorage.getItem('settings_mfa');
      if (settingsMfa) {
        this.mfaApiService.updateDetailSettings().subscribe({
          next: () => {
            this.loadSettings();
            this.loadingMfa = false;
            return;
          },
          error: () => {
            this.loadingMfa = false;
            this.loadingCategories = false;
          },
        });
      } else {
        // if settings missing in the storage, load them
        this.loadSettings();
        this.loadingMfa = false;
      }
    } else {
      // load enforce_mfa from attribute
      const enforceMfaAttributeName = this.store.getProperty('mfa').enforce_mfa_attribute;
      this.attributesManagerService
        .getUserAttributeByName(this.store.getPerunPrincipal().userId, enforceMfaAttributeName)
        .subscribe({
          next: (attr) => {
            this.originalMfa = !!attr.value;
            this.loadSettings();
            this.loadingMfa = false;
          },
          error: (e) => {
            console.error(e);
            this.loadingMfa = false;
            this.loadingCategories = false;
          },
        });
    }
  }

  loadSettings(): void {
    this.mfaApiService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.setSelections();
        this.loadingCategories = false;
      },
      error: () => {
        this.loadingMfa = false;
        this.loadingCategories = false;
      },
    });
  }

  setSelections(): void {
    // Check if the settings have categories
    this.enableDetailSettings =
      this.settings.categories && Object.keys(this.settings.categories).length > 0;
    this.categorySelection = new SelectionModel<string>(true, this.settings.includedCategories);
    this.allCategoriesKeys = Object.keys(this.settings.categories);
    // Select if 'allEnforced' is true
    this.enforceMfa = this.settings.includedCategories.length > 0 || this.settings.allEnforced;
    for (const category in this.settings.categories) {
      this.allRpsKeysByCategory.set(
        category,
        Object.keys(this.settings.rpsByCategory[category] as object)
      );
      this.rpsSelections.set(
        category,
        new SelectionModel<string>(true, this.settings.includedRpsByCategory[category] as string[])
      );
    }
    this.checkAllRpsSelected();
  }

  toggleEnableMfa(checked: boolean): void {
    this.unchangedSettings = false;
    if (checked) {
      this.categorySelection.setSelection(...Object.keys(this.settings.categories));
      for (const category in this.settings.categories) {
        this.rpsSelections
          .get(category)
          .setSelection(...Object.keys(this.settings.rpsByCategory[category] as object));
      }
    } else {
      this.categorySelection.clear();
      for (const category in this.settings.categories) {
        this.rpsSelections.get(category).clear();
      }
    }
    this.checkAllRpsSelected();
  }

  toggleCategory(categoryAny: any, checked: boolean): void {
    this.unchangedSettings = false;
    const category = String(categoryAny);
    if (checked) {
      this.categorySelection.select(category);
      for (const rps in this.settings.rpsByCategory[category]) {
        this.rpsSelections.get(category).select(rps);
      }
      this.enforceMfa = true;
    } else {
      this.categorySelection.deselect(category);
      this.rpsSelections.get(category).clear();
      if (this.categorySelection.isEmpty()) {
        this.enforceMfa = false;
      }
    }
    this.checkAllRpsSelected();
  }

  toggleRps(categoryAny: any, rpsAny: any, checked: boolean): void {
    const rps = String(rpsAny);
    const category = String(categoryAny);
    this.unchangedSettings = false;
    if (checked) {
      this.rpsSelections.get(category).select(rps);
      this.categorySelection.select(category);
      this.enforceMfa = true;
    } else {
      this.rpsSelections.get(category).deselect(rps);
      if (this.rpsSelections.get(category).isEmpty()) {
        this.categorySelection.deselect(category);
        if (this.categorySelection.isEmpty()) {
          this.enforceMfa = false;
        }
      }
    }
    this.checkAllRpsSelected();
  }

  /**
   * This method fires logic for setting new values of settings
   */
  saveSettings(enforceFirstMfa = false): void {
    this.loadingMfa = true;
    // enforce all only if all rps + categories are truly checked (checkbox isn't indeterminate)
    const newEnforce = this.enforceMfa && !this.checkbox.indeterminate;
    sessionStorage.setItem('enforce_mfa', newEnforce.toString());
    this.saveDetailSettings();
    this.mfaApiService.saveSettings(newEnforce, enforceFirstMfa).subscribe({
      next: () => {
        this.unchangedSettings = true;
        this.loadingMfa = false;
      },
      error: () => {
        this.loadingMfa = false;
      },
    });
  }

  checkAllRpsSelected(): void {
    for (const category in this.settings.categories) {
      if (
        this.rpsSelections.get(category).selected.length !==
        Object.keys(this.settings.rpsByCategory[category] as object).length
      ) {
        this.allRpsSelected = false;
        return;
      }
    }
    this.allRpsSelected = true;
  }

  /**
   * This method creates request body for new settings according to toggles
   */
  saveDetailSettings(): void {
    this.settings.includedCategories = this.categorySelection.selected;
    this.settings.excludedRps = [];
    for (const category of this.settings.includedCategories) {
      this.settings.includedRpsByCategory[category] = this.rpsSelections.get(category).selected;
      this.settings.excludedRps.push(
        ...Object.keys(this.settings.rpsByCategory[category] as object).filter(
          (rps) => !this.rpsSelections.get(category).selected.includes(rps)
        )
      );
    }

    this.mfaApiService.saveDetailSettings(this.settings);
  }

  redirectToMfa(): void {
    window.open(this.mfaUrl, '_blank');
  }
}
