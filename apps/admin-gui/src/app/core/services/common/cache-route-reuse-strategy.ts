import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { VoMembersComponent } from '../../../vos/pages/vo-detail-page/vo-members/vo-members.component';
import { VoGroupsComponent } from '../../../vos/pages/vo-detail-page/vo-groups/vo-groups.component';
import { VoApplicationsComponent } from '../../../vos/pages/vo-detail-page/vo-applications/vo-applications.component';
import { GroupApplicationsComponent } from '../../../vos/pages/group-detail-page/group-applications/group-applications.component';
import { GroupResourcesComponent } from '../../../vos/pages/group-detail-page/group-resources/group-resources.component';
import { GroupSubgroupsComponent } from '../../../vos/pages/group-detail-page/group-subgroups/group-subgroups.component';
import { GroupMembersComponent } from '../../../vos/pages/group-detail-page/group-members/group-members.component';
import { FacilityAllowedGroupsComponent } from '../../../facilities/pages/facility-detail-page/facility-allowed-groups/facility-allowed-groups.component';
import { FacilityResourcesComponent } from '../../../facilities/pages/facility-detail-page/facility-resources/facility-resources.component';
import { MemberGroupsComponent } from '../../../vos/pages/member-detail-page/member-groups/member-groups.component';
import { VoResourcesPreviewComponent } from '../../../vos/pages/vo-detail-page/vo-resources/vo-resources-preview/vo-resources-preview.component';
import { VoResourcesStatesComponent } from '../../../vos/pages/vo-detail-page/vo-resources/vo-resources-states/vo-resources-states.component';
import { AdminUsersComponent } from '../../../admin/pages/admin-page/admin-users/admin-users.component';
import { VoSettingsApplicationFormComponent } from '../../../vos/pages/vo-detail-page/vo-settings/vo-settings-application-form/vo-settings-application-form.component';
import { GroupSettingsApplicationFormComponent } from '../../../vos/pages/group-detail-page/group-settings/group-settings-application-form/group-settings-application-form.component';
import { VoSelectPageComponent } from '../../../vos/pages/vo-select-page/vo-select-page.component';
import { FacilitySelectPageComponent } from '../../../facilities/pages/facility-select-page/facility-select-page.component';
import { VoSettingsSponsoredMembersComponent } from '../../../vos/pages/vo-detail-page/vo-settings/vo-settings-sponsored-members/vo-settings-sponsored-members.component';
import { AdminSearcherComponent } from '../../../admin/pages/admin-page/admin-searcher/admin-searcher.component';
import { AdminServicesComponent } from '../../../admin/pages/admin-page/admin-services/admin-services.component';
import { FacilityAllowedUsersComponent } from '../../../facilities/pages/facility-detail-page/facility-allowed-users/facility-allowed-users.component';
import { GroupRolesComponent } from '../../../vos/pages/group-detail-page/group-roles/group-roles.component';

export class CachedRoute {
  routeHandle: DetachedRouteHandle;
  saveTimeStamp: number;
}

@Injectable()
export class CacheRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<string, CachedRoute>();
  private cachedComponents = new Set<string>([
    VoMembersComponent.id,
    VoGroupsComponent.id,
    VoApplicationsComponent.id,
    VoResourcesPreviewComponent.id,
    VoResourcesStatesComponent.id,
    VoSettingsApplicationFormComponent.id,
    VoSettingsSponsoredMembersComponent.id,
    GroupMembersComponent.id,
    GroupSubgroupsComponent.id,
    GroupResourcesComponent.id,
    GroupRolesComponent.id,
    GroupApplicationsComponent.id,
    GroupSettingsApplicationFormComponent.id,
    FacilityAllowedGroupsComponent.id,
    FacilityResourcesComponent.id,
    FacilityAllowedUsersComponent.id,
    MemberGroupsComponent.id,
    AdminUsersComponent.id,
    AdminSearcherComponent.id,
    AdminServicesComponent.id,
    VoSelectPageComponent.id,
    FacilitySelectPageComponent.id,
  ]);

  private cacheTimeMs = 300_000;

  private isUserNavigatingBack = false;

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * Return handlers from cache or null if they are not cached,
   *
   * @param route route
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.getKey(route);
    if (!this.handlers.has(key)) return null;

    return this.handlers.get(key).routeHandle;
  }

  /**
   * Returns true if the route should be used from cache.
   *
   * @param route route
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (!this.isUserNavigatingBack || !route.component) {
      return false;
    }

    const cachedData = this.handlers.get(this.getKey(route));
    return cachedData && this.getCurrentTimestamp() - cachedData.saveTimeStamp < this.cacheTimeMs;
  }

  /**
   * Returns true if the route should be cached.
   *
   * @param route route
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const componentId = this.getComponentId(route.component);
    return this.cachedComponents.has(componentId);
  }

  /**
   * Stores given handlers for given route.
   *
   * @param route route
   * @param detachedTree handlers
   */
  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    // Removes active tooltips, so they are not cached
    while (document.getElementsByTagName('mat-tooltip-component').length > 0) {
      document.getElementsByTagName('mat-tooltip-component')[0].remove();
    }

    this.handlers.set(this.getKey(route), {
      routeHandle: detachedTree,
      saveTimeStamp: this.getCurrentTimestamp(),
    });
  }

  setLastNavigationType(type: 'back' | 'direct'): void {
    this.isUserNavigatingBack = type === 'back';
  }

  /**
   * Parses component id from its source.
   * @param component as a class
   */
  private getComponentId(component): string {
    // eslint-disable-next-line
    return component.id as string;
  }

  /**
   * Constructs full url from route snapshot, that is used as unique key
   * @param route snapshot of activated route
   */
  private getKey(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot.map((r) => r.url.map((segment) => segment.toString())).join('/');
  }

  private getCurrentTimestamp(): number {
    return +Date.now();
  }
}
