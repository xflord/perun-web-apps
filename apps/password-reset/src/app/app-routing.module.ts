import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {
  LoginScreenComponent,
  LoginScreenServiceAccessComponent,
} from '@perun-web-apps/perun/login';

const routes: Routes = [
  {
    path: 'service-access',
    component: LoginScreenServiceAccessComponent,
  },
  {
    path: 'login',
    component: LoginScreenComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {}), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
