import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { PasswordFormComponent } from './password-form/password-form.component';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatInputModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    UiAlertsModule,
  ],
  declarations: [PasswordFormComponent],
  exports: [PasswordFormComponent],
  providers: [],
})
export class PerunNamespacePasswordFormModule {}
