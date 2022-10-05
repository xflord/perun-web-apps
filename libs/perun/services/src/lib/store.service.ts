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
  private instanceConfig: PerunConfig;
  private defaultConfig: PerunConfig;
  private appsConfig: PerunAppsConfig;
  private principal: PerunPrincipal;
  private initialPageId: number;
  private branding = '';

  setInstanceConfig(instanceConfig: PerunConfig): void {
    this.instanceConfig = instanceConfig;
  }

  setDefaultConfig(defaultConfig: PerunConfig): void {
    this.defaultConfig = defaultConfig;
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

  setBanding(branding: string): void {
    this.branding = branding;
  }

  getProperty<T extends keyof PerunConfig>(key: T): PerunConfig[T] {
    if (!this.instanceConfig || !this.defaultConfig) {
      return null;
    }

    const configs: PerunConfig[] = [
      this.instanceConfig?.brandings?.[this.branding],
      this.instanceConfig,
    ];

    const defaultValue: PerunConfig[T] = this.defaultConfig[key];
    let currentValue: PerunConfig[T] = null;
    for (const config of configs) {
      if (config && (currentValue === null || currentValue === undefined)) {
        currentValue = config[key];
      }
    }
    if (currentValue === null) {
      return defaultValue;
    }

    return this.addMissingValuesToProperty(currentValue, defaultValue);
  }

  addMissingValuesToProperty<T extends object, K extends keyof T>(
    value: T[K],
    defaultValue: T[K]
  ): T[K] {
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value !== null &&
      value !== undefined
    ) {
      for (const key of Object.keys(defaultValue)) {
        defaultValue[key] = this.addMissingValuesToProperty(
          value[key] as T[K],
          defaultValue[key] as T[K]
        );
      }
    } else if (value !== null && value !== undefined) {
      return value;
    }
    return defaultValue;
  }
}
