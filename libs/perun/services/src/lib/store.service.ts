/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { PerunAppsConfig, PerunPrincipal } from '@perun-web-apps/perun/openapi';

interface CopyrightItem {
  name: string;
  url: string;
}

interface FooterElement {
  logo: string;
  icon: string;
  dialog?: string;
  link_en?: string;
  link_cs?: string;
  label_en?: string;
  label_cs?: string;
}

interface FooterColumn {
  title_en?: string;
  title_cs?: string;
  logos?: boolean;
  elements: FooterElement[];
}

interface Footer {
  columns: FooterColumn[];
  copyrightItems: CopyrightItem[];
}

export interface PerunConfig {
  config: string;
  api_url: string;
  oidc_client: object; // can be specified further
  password_namespace_attributes: string[];
  pwd_reset_base_url: string;
  auto_auth_redirect?: boolean;
  supported_languages?: string[];
  login_namespace_attributes?: string[];
  log_out_enabled?: boolean;
  profile_label_en?: string;
  footer?: Footer;
  is_devel?: boolean;
  instance_favicon?: boolean;
  document_title?: string;
  allow_empty_sponsor_namespace?: string;
  member_profile_attributes_friendly_names?: string[];
  skip_oidc?: boolean;
  groupNameSecondaryRegex?: string;
  groupNameErrorMessage?: string;
  brandings?: object;
  display_warning?: boolean;
  warning_message?: string;
}

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
    return this.get('login_namespace_attributes') as string[];
  }

  getMemberProfileAttributeNames(): string[] {
    return this.get('member_profile_attributes_friendly_names') as string[];
  }

  setBanding(branding: string): void {
    this.branding = branding;
  }

  skipOidc(): boolean {
    return this.get('skip_oidc') as boolean;
  }

  /**
   * Get key from json configuration. If key is not present in instance
   * configuration method returns value from default configuration.
   * @param keys
   */
  get(...keys: string[]): any {
    let currentValue: string;

    if (this.branding !== '') {
      const brandingConfig: PerunConfig = this.instanceConfig.brandings[
        this.branding
      ] as PerunConfig;
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
