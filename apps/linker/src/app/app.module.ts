import { APP_INITIALIZER, forwardRef, NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { ShowResultComponent } from './components/show-result/show-result.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import {
  ApiInterceptor,
  ApiService,
  CustomIconService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiModule, Configuration, ConfigurationParameters } from '@perun-web-apps/perun/openapi';
import { LinkerConfigService } from './service/linker-config.service';
import { PERUN_API_SERVICE } from '@perun-web-apps/perun/tokens';
import { UiMaterialModule } from '@perun-web-apps/ui/material';
import { PerunLoginModule } from '@perun-web-apps/perun/login';
import { MatIconModule } from '@angular/material/icon';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { PerunUtilsModule } from '@perun-web-apps/perun/utils';
import { GeneralModule } from '@perun-web-apps/general';
import { OAuthModule } from 'angular-oauth2-oidc';
import { LibLinkerModule } from '@perun-web-apps/lib-linker';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SendMessageDialogComponent } from './components/send-message-dialog/send-message-dialog.component';

export const API_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useExisting: forwardRef(() => ApiInterceptor),
  multi: true,
};

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function apiConfigFactory(store: StoreService): Configuration {
  const params: ConfigurationParameters = {
    basePath: store.getProperty('api_url'),
  };
  return new Configuration(params);
}

const loadConfigs = (appConfig: LinkerConfigService) => (): Promise<void> =>
  appConfig.loadConfigs();

@NgModule({
  declarations: [AppComponent, ShowResultComponent, SendMessageDialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ApiModule,
    AppRoutingModule,
    UiMaterialModule,
    PerunLoginModule,
    MatIconModule,
    PerunSharedComponentsModule,
    UiAlertsModule,
    PerunUtilsModule,
    GeneralModule,
    OAuthModule.forRoot(),
    LibLinkerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    CustomIconService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfigs,
      multi: true,
      deps: [LinkerConfigService],
    },
    {
      provide: Configuration,
      useFactory: apiConfigFactory,
      deps: [StoreService],
    },
    ApiInterceptor,
    API_INTERCEPTOR_PROVIDER,
    {
      provide: PERUN_API_SERVICE,
      useClass: ApiService,
    },
    { provide: OAuthStorage, useFactory: (): OAuthStorage => localStorage },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private customIconService: CustomIconService, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.customIconService.registerPerunRefreshIcon();
  }
}
