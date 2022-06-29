import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { RouterModule } from '@angular/router';
import { OAuthStorage } from 'angular-oauth2-oidc';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [BrowserModule, RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' })],
  providers: [{ provide: OAuthStorage, useFactory: (): OAuthStorage => localStorage }],
  bootstrap: [AppComponent],
})
export class AppModule {}
