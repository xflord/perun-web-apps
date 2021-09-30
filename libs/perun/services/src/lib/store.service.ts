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

  skipOidc(): boolean {
    return this.getProperty('skip_oidc');
  }

  getProperty<T extends keyof PerunConfig>(key: T): PerunConfig[T] {
    const configs: PerunConfig[] = [
      this.instanceConfig?.brandings?.[this.branding],
      this.instanceConfig,
      this.defaultConfig,
    ];

    let currentValue: PerunConfig[T] = null;
    for (const config of configs) {
      if (config && !currentValue) {
        currentValue = config[key];
      }
    }

    return currentValue;
  }

  /**
   * @deprecated - Use method `getProperty` instead.
   */
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
  get(...keys: string[]): any {
    let currentValue: string;

    if (this.branding !== '') {
      const brandingConfig: PerunConfig = this.instanceConfig.brandings[this.branding];
      for (let i = 0; i < keys.length; ++i) {
        if (i === 0) {
          currentValue = brandingConfig[keys[i]];
        } else {
          if (currentValue === undefined) {
            break;
          }
          currentValue = currentValue[keys[i]];
        }
      }
    }

    if (this.instanceConfig !== undefined && currentValue === undefined) {
      for (let i = 0; i < keys.length; ++i) {
        if (i === 0) {
          currentValue = this.instanceConfig[keys[i]];
        } else {
          if (currentValue === undefined) {
            break;
          }
          currentValue = currentValue[keys[i]];
        }
      }
    }

    if (this.defaultConfig === undefined) {
      return undefined;
    }
    if (currentValue === undefined) {
      for (let i = 0; i < keys.length; ++i) {
        if (i === 0) {
          currentValue = this.defaultConfig[keys[i]];
        } else {
          if (currentValue === undefined) {
            // console.error('Missing value in default config: ' + keys);
            break;
          }
          currentValue = currentValue[keys[i]];
        }
      }
    }

    return currentValue;
  }
}
