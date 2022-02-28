import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanDeactivate,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { FacilityConfigurationPageComponent } from '../pages/facility-configuration-page/facility-configuration-page.component';

@Injectable({
  providedIn: 'root',
})
export class ConfigureFacilityGuardService
  implements CanActivate, CanDeactivate<FacilityConfigurationPageComponent>
{
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route.parent.params['facilityId'] === sessionStorage.getItem('newFacilityId')) {
      return true;
    }
    void this.router.navigate(['/home'], { queryParamsHandling: 'merge' });
    return false;
  }

  canDeactivate(
    component: FacilityConfigurationPageComponent
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return component.canDeactivate();
  }
}
