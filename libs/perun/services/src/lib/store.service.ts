import { Injectable } from '@angular/core';
import { PerunAppsConfig, PerunPrincipal } from '@perun-web-apps/perun/openapi';
import { PerunConfig } from '@perun-web-apps/perun/models';

/**
 * Class that just store data about instance and default configuration.
 * No logic involved.
 */
@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private config: PerunConfig;
  private appsConfig: PerunAppsConfig;
  private principal: PerunPrincipal;
  private initialPageId: number;

  setDefaultConfig(defaultConfig: PerunConfig): void {
    this.config = defaultConfig;
  }

  getAppsConfig(): PerunAppsConfig {
    return this.appsConfig;
  }

  setAppsConfig(appsConfig: PerunAppsConfig): void {
    this.appsConfig = appsConfig;
  }

  setPerunPrincipal(principal: PerunPrincipal): void {
    this.principal = principal;
  }

  getPerunPrincipal(): PerunPrincipal {
    return this.principal;
  }

  getInitialPageId(): number {
    return this.initialPageId;
  }

  setInitialPageId(pageId: number): void {
    this.initialPageId = pageId;
  }

  getLoginAttributeNames(): string[] {
    return this.getProperty('login_namespace_attributes');
  }

  getMemberProfileAttributeNames(): string[] {
    return this.getProperty('member_profile_attributes_friendly_names');
  }

  getProperty<T extends keyof PerunConfig>(key: T): PerunConfig[T] {
    if (!this.config) {
      return null;
    }
    return this.config[key];
  }

  /*
  Merges a config into the existing config, substituting values in the existing with values in the configToMerge.
  Objects are merged per property, not as a whole (see `addMissingValuesToProperty`)
  Be careful of order of merging (make sure default config is set before merging another config)
   */
  mergeConfig<T extends object, K extends keyof T>(configToMerge: PerunConfig): void {
    for (const key of Object.keys(configToMerge)) {
      if (key === 'brandings') continue;
      this.config[key] = this.addMissingValuesToProperty(
        configToMerge[key] as T[K],
        this.config[key] as T[K],
      );
    }
  }

  /*
  For an object property, merge properties from the `defaultValue` with properties from `value`.
  Properties defined in `value` are overwritten with their value, remaining properties are kept from `defaultValue`
  Returns `value` if a simple type is passed.
  Works recursively
   */
  private addMissingValuesToProperty<T extends object, K extends keyof T>(
    value: T[K],
    defaultValue: T[K],
  ): T[K] {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const key of Object.keys(defaultValue)) {
        value[key] = this.addMissingValuesToProperty(value[key] as T[K], defaultValue[key] as T[K]);
      }
    }
    return value;
  }
}
