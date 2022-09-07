import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { MatIconModule } from '@angular/material/icon';
import { MfaRequiredDialogComponent } from './mfa-required-dialog/mfa-required-dialog.component';
import { FocusOnMfaWindowComponent } from './focus-on-mfa-window/focus-on-mfa-window.component';
import { NoMfaTokensDialogComponent } from './no-mfa-tokens-dialog/no-mfa-tokens-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    UiAlertsModule,
    MatIconModule,
  ],
  declarations: [MfaRequiredDialogComponent, FocusOnMfaWindowComponent, NoMfaTokensDialogComponent],
  exports: [MfaRequiredDialogComponent, FocusOnMfaWindowComponent, NoMfaTokensDialogComponent],
})
export class PerunMultiFactorAuthenticationModule {}
