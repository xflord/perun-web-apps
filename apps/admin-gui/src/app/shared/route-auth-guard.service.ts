import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  GuiAuthResolver,
  NotificatorService,
  RoutePolicyService,
} from '@perun-web-apps/perun/services';
import { PerunBean } from '@perun-web-apps/perun/openapi';

interface AuthPair {
  key: string;
  entity: PerunBean;
}

@Injectable({
  providedIn: 'root',
})
export class RouteAuthGuardService implements CanActivateChild {
  constructor(
    private authResolver: GuiAuthResolver,
    private routePolicyService: RoutePolicyService,
    private router: Router,
    private notificator: NotificatorService
  ) {}

  private static getBeanName(key: string): string {
    switch (key) {
      case 'organizations':
        return 'Vo';
      case 'groups':
        return 'Group';
      case 'facilities':
        return 'Facility';
      case 'resources':
        return 'Resource';
      case 'members':
        return 'Member';
      default:
        return '';
    }
  }

  private static parseUrl(url: string): AuthPair {
    const segments: string[] = url.slice(1).split('/').reverse();
    const authPair: AuthPair = { key: '', entity: { id: -1, beanName: '' } };

    for (const segment of segments) {
      if (Number(segment)) {
        if (authPair.entity.id === -1) {
          authPair.entity.id = Number(segment);
          continue;
        }
        break;
      }

      authPair.key = segment.concat('-', authPair.key);
    }

    authPair.key = authPair.key.slice(0, authPair.key.length - 1);
    authPair.entity.beanName = RouteAuthGuardService.getBeanName(authPair.key.split('-')[0]);
    return authPair;
  }

  canActivateChild(
    _childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authResolver.isPerunAdminOrObserver()) {
      return true;
    }

    const authPair: AuthPair = RouteAuthGuardService.parseUrl(state.url);
    const isAuthorized: boolean = this.routePolicyService.canNavigate(
      authPair.key,
      authPair.entity
    );

    if (isAuthorized) {
      return true;
    }

    this.notificator.showRouteError();
    return this.router.parseUrl('/notAuthorized');
  }
}
