import { NoPreloading, RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from '@perun-web-apps/perun/login';
import { NgModule } from '@angular/core';
import { MainWindowComponent } from './components/main-window/main-window.component';
import { ShowResultPageComponent } from './components/show-result-page/show-result-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'consolidate',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginScreenComponent,
  },
  {
    path: 'consolidate',
    component: MainWindowComponent,
  },
  {
    path: 'result/:result',
    component: ShowResultPageComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: NoPreloading,
      scrollPositionRestoration: 'enabled',
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
