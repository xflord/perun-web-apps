import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ShowResultComponent } from './components/show-result/show-result.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'result',
    pathMatch: 'full',
  },
  {
    path: 'result/:result',
    component: ShowResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
