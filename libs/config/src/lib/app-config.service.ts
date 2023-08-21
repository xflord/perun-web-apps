/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StoreService } from '@perun-web-apps/perun/services';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { Title } from '@angular/platform-browser';
import { UtilsService } from '@perun-web-apps/perun/openapi';
import { PerunConfig } from '@perun-web-apps/perun/models';

export interface Link extends Element {
  rel: string;
  type: string;
  href: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  constructor(
    private http: HttpClient,
    private storeService: StoreService,
    private authzSevice: AuthzResolverService,
    private titleService: Title,
    private utilsService: UtilsService
  ) {}

  /**
   * Load default configuration.
   * If instance is not in production mode, the configuration is also
   * taken as instance configuration and load additional data.
   */
  loadAppDefaultConfig(): Promise<void> {
    return new Promise((resolve) => {
      this.http
        .get('/assets/config/defaultConfig.json', {
          headers: this.getNoCacheHeaders(),
        })
        .subscribe((config: PerunConfig) => {
          this.storeService.setDefaultConfig(config);
          resolve();
        });
    });
  }

  /**
   * Load instance configuration.
   * If instance is in production mode, configuration mode is assigned to
   * instance config and load additional data.
   */
  loadAppInstanceConfig(): Promise<void> {
    return new Promise((resolve) => {
      this.http
        .get('/assets/config/instanceConfig.json', {
          headers: this.getNoCacheHeaders(),
        })
        .subscribe(
          (config: PerunConfig) => {
            this.storeService.setInstanceConfig(config);
            const branding = document.location.hostname;
            if (config?.['brandings']?.[branding]) {
              this.storeService.setBanding(branding);
            }
            resolve();
          },
          () => {
            // console.log('instance config not detected');
            resolve();
          }
        );
    });
  }

  getNoCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      CacheControl: 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0',
    });
  }

  setInstanceFavicon(): Promise<void> {
    return new Promise((resolve) => {
      const link: Link =
        document.querySelector(`link[rel*='icon']`) || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';

      if (this.storeService.getProperty('instance_favicon')) {
        link.href = './assets/config/instanceFavicon.ico';
      } else {
        link.href = './assets/img/perun.ico';
      }
      document.getElementsByTagName('head')[0].appendChild(link);
      resolve();
    });
  }

  /**
   *  We need to set basePath for authzService before loading principal, otherwise authzService uses its default basePath
   */
  setApiUrl(): Promise<void> {
    return new Promise<void>((resolve) => {
      let apiUrl: string = this.storeService.getProperty('api_url');
      if (
        location.pathname === '/service-access' ||
        sessionStorage.getItem('baPrincipal') ||
        this.storeService.getProperty('auto_service_access_redirect')
      ) {
        apiUrl = apiUrl.replace('oauth', 'ba');
      }
      this.authzSevice.configuration.basePath = apiUrl;
      this.titleService.setTitle(this.storeService.getProperty('document_title').en);
      resolve();
    });
  }

  loadAppsConfig(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.utilsService.getAppsConfig().subscribe(
        (appsConfig) => {
          this.storeService.setAppsConfig(appsConfig);
          resolve();
        },
        (error) => reject(error)
      );
    });
  }
}
