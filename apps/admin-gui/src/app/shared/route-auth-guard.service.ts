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
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  RoutePolicyService,
} from '@perun-web-apps/perun/services';
import {
  GroupsManagerService,
  MembersManagerService,
  ResourcesManagerService,
} from '@perun-web-apps/perun/openapi';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { RPCError } from '@perun-web-apps/perun/models';

interface PerunBeanExtension {
  id: number;
  beanName: string;
  userId?: number;
  voId?: number;
  facilityId?: number;
}

interface AuthPair {
  key: string;
  entity: PerunBeanExtension;
}

@Injectable({
  providedIn: 'root',
})
export class RouteAuthGuardService implements CanActivateChild {
  constructor(
    private authResolver: GuiAuthResolver,
    private routePolicyService: RoutePolicyService,
    private router: Router,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService,
    private memberManager: MembersManagerService,
    private groupManager: GroupsManagerService,
    private resourceManager: ResourcesManagerService
  ) {}

  private static getBeanName(key: string): string {
    switch (key) {
      case 'organizations':
        return 'Vo';
      case 'groups':
        return 'Group';
      case 'facilities':
        return 'Facility';
      // just for /facilities/:facilityId/services-status/:taskId - correct auth object is facility
      case 'services':
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
        // replace taskId with facilityId for task results page (/facilities/:facilityId/services-status/:taskId)
        if (authPair.key === 'services-status-') {
          authPair.entity.id = Number(segment);
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

    if (authPair.key.startsWith('members')) {
      this.apiRequest.dontHandleErrorForNext();
      return this.memberManager.getMemberById(authPair.entity.id).pipe(
        map((member) => {
          authPair.entity.userId = member.userId;
          authPair.entity.voId = member.voId;
          return this.finalizeCanActivateChild(authPair);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.errorRedirectUrl(error.error as RPCError);
        })
      );
    } else if (authPair.key.startsWith('groups')) {
      this.apiRequest.dontHandleErrorForNext();
      return this.groupManager.getGroupById(authPair.entity.id).pipe(
        map((group) => {
          authPair.entity.voId = group.voId;
          return this.finalizeCanActivateChild(authPair);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.errorRedirectUrl(error.error as RPCError);
        })
      );
    } else if (authPair.key.startsWith('resources')) {
      this.apiRequest.dontHandleErrorForNext();
      return this.resourceManager.getResourceById(authPair.entity.id).pipe(
        map((resource) => {
          authPair.entity.facilityId = resource.facilityId;
          authPair.entity.voId = resource.voId;
          return this.finalizeCanActivateChild(authPair);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.errorRedirectUrl(error.error as RPCError);
        })
      );
    } else {
      return this.finalizeCanActivateChild(authPair);
    }
  }

  finalizeCanActivateChild(authPair: AuthPair): boolean | UrlTree {
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

  errorRedirectUrl(error: RPCError): Observable<UrlTree> {
    if (error.name === 'PrivilegeException') {
      this.notificator.showRouteError();
      return of(this.router.parseUrl('/notAuthorized'));
    }
  }
}
