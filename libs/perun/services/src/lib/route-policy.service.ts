import { Injectable } from '@angular/core';
import { Facility, Group, Member, Resource, User, Vo } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from './gui-auth-resolver.service';

type Entity = Vo | Group | Resource | Facility | Member | User;

@Injectable({
  providedIn: 'root',
})
export class RoutePolicyService {
  // Map of page key and function determining if user is authorized to access given page
  private routePolicies: Map<string, (entity: Entity) => boolean> = new Map<
    string,
    (entity: Entity) => boolean
  >([
    [
      'organizations-members',
      (vo): boolean =>
        this.authResolver.isAuthorized('getMembersPage_Vo_MembersPageQuery_List<String>_policy', [
          vo,
        ]),
    ],
    [
      'organizations-groups',
      (vo): boolean =>
        this.authResolver.isAuthorized(
          'getAllRichGroupsWithAttributesByNames_Vo_List<String>_policy',
          [vo]
        ),
    ],
    [
      'organizations-resources',
      (vo): boolean =>
        this.authResolver.isAuthorized('getRichResources_Vo_policy', [vo]) ||
        this.authResolver.isAuthorized('getAllResourcesTagsForVo_Vo_policy', [vo]) ||
        this.authResolver.isAuthorized('getResourcesState_Vo_policy', [vo]),
    ],
    [
      'organizations-resources-preview',
      (vo): boolean => this.authResolver.isAuthorized('getRichResources_Vo_policy', [vo]),
    ],
    [
      'organizations-resources-tags',
      (vo): boolean => this.authResolver.isAuthorized('getAllResourcesTagsForVo_Vo_policy', [vo]),
    ],
    [
      'organizations-resources-states',
      (vo): boolean => this.authResolver.isAuthorized('getResourcesState_Vo_policy', [vo]),
    ],
    [
      'organizations-applications',
      (vo): boolean =>
        this.authResolver.isAuthorized('getApplicationsForVo_Vo_List<String>_Boolean_policy', [vo]),
    ],
    [
      'organizations-sponsoredMembers',
      (vo): boolean =>
        this.authResolver.isAuthorized('getSponsoredMembersAndTheirSponsors_Vo_policy', [vo]),
    ],
    [
      'organizations-serviceAccounts',
      (vo): boolean =>
        this.authResolver.isAuthorized(
          `createSpecificMember_Vo_Candidate_List<User>_SpecificUserType_List<Group>_policy`,
          [vo]
        ),
    ],
    ['organizations-attributes', (): boolean => true],
    [
      'organizations-statistics',
      (vo): boolean =>
        this.authResolver.isAuthorized('getMembersCount_Vo_Status_policy', [vo]) &&
        this.authResolver.isAuthorized('getMembersCount_Vo_policy', [vo]),
    ],
    [
      'organizations-settings',
      (vo): boolean =>
        this.authResolver.isManagerPagePrivileged(vo) ||
        this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [vo]) ||
        this.authResolver.isThisVoAdminOrObserver(vo.id),
    ],
    [
      'organizations-settings-expiration',
      (vo): boolean => this.authResolver.isThisVoAdminOrObserver(vo.id),
    ],
    [
      'organizations-settings-managers',
      (vo): boolean => this.authResolver.isManagerPagePrivileged(vo),
    ],
    [
      'organizations-settings-applicationForm',
      (vo): boolean => this.authResolver.isThisVoAdminOrObserver(vo.id),
    ],
    [
      'organizations-settings-notifications',
      (vo): boolean => this.authResolver.isThisVoAdminOrObserver(vo.id),
    ],
    [
      'organizations-settings-extsources',
      (vo): boolean => this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [vo]),
    ],
  ]);

  constructor(private authResolver: GuiAuthResolver) {}

  /**
   * Determines whether user can access given page or not,
   * default is true
   *
   * @param key: page key
   * @param entity: entity connected to given page
   *
   * @returns true if user can access page, false otherwise
   * */
  canNavigate(key: string, entity: Entity): boolean {
    const authorize: (e: Entity) => boolean = this.routePolicies.get(key);
    return authorize ? authorize(entity) : true;
  }
}
