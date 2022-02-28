import { Injectable } from '@angular/core';
import { NavigationStart, Router, RouteReuseStrategy } from '@angular/router';
import { CacheRouteReuseStrategy } from './cache-route-reuse-strategy';

@Injectable({
  providedIn: 'root',
})
export class CacheHelperService {
  constructor(private router: Router, private routeReuseStrategy: RouteReuseStrategy) {
    const cache = routeReuseStrategy as CacheRouteReuseStrategy;

    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          cache.setLastNavigationType('back');
        } else {
          cache.setLastNavigationType('direct');
        }
      }
    });
  }

  // Do not remove. This method is used to instantiate this service.
  // eslint-disable-next-line
  init(): void {}
}
