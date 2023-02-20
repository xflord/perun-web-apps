import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginScreenComponent } from './login-screen/login-screen.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoginScreenBaseComponent } from './login-screen-base/login-screen-base.component';
import { RouterModule } from '@angular/router';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { TranslateModule } from '@ngx-translate/core';
import { LoginScreenServiceAccessComponent } from './login-screen-service-access/login-screen-service-access.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { UiLoadersModule } from '@perun-web-apps/ui/loaders';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    PerunSharedComponentsModule,
    TranslateModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    UiAlertsModule,
    UiLoadersModule,
  ],
  declarations: [LoginScreenComponent, LoginScreenBaseComponent, LoginScreenServiceAccessComponent],
  exports: [LoginScreenBaseComponent, LoginScreenComponent, LoginScreenServiceAccessComponent],
})
export class PerunLoginModule {}
