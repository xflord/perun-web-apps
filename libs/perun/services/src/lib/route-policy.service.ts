import { Injectable } from '@angular/core';
import { Facility, Group, Member, Resource, User, Vo } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from './gui-auth-resolver.service';

type Entity = Vo | Group | Resource | Facility | Member | User;

@Injectable({
  providedIn: 'root',
})
export class RoutePolicyService {
  constructor(private authResolver: GuiAuthResolver) {}

  // Map of page key and function determining if user is authorized to access given page
  private routePolicies: Map<string, (entity: Entity) => boolean> = new Map<
    string,
    (entity: Entity) => boolean
  >([
    [
      'organizations-members',
      (vo) => this.authResolver.isAuthorized('getCompleteRichMembers_Vo_List<String>_policy', [vo]),
    ],
    [
      'organizations-groups',
      (vo) =>
        this.authResolver.isAuthorized(
          'getAllRichGroupsWithAttributesByNames_Vo_List<String>_policy',
          [vo]
        ),
    ],
    [
      'organizations-resources',
      (vo) =>
        this.authResolver.isAuthorized('getRichResources_Vo_policy', [vo]) ||
        this.authResolver.isAuthorized('getAllResourcesTagsForVo_Vo_policy', [vo]) ||
        this.authResolver.isAuthorized('getResourcesState_Vo_policy', [vo]),
    ],
    [
      'organizations-resources-preview',
      (vo) => this.authResolver.isAuthorized('getRichResources_Vo_policy', [vo]),
    ],
    [
      'organizations-resources-tags',
      (vo) => this.authResolver.isAuthorized('getAllResourcesTagsForVo_Vo_policy', [vo]),
    ],
    [
      'organizations-resources-states',
      (vo) => this.authResolver.isAuthorized('getResourcesState_Vo_policy', [vo]),
    ],
    [
      'organizations-applications',
      (vo) =>
        this.authResolver.isAuthorized('getApplicationsForVo_Vo_List<String>_Boolean_policy', [vo]),
    ],
    [
      'organizations-sponsoredMembers',
      (vo) => this.authResolver.isAuthorized('getSponsoredMembersAndTheirSponsors_Vo_policy', [vo]),
    ],
    [
      'organizations-serviceAccounts',
      (vo) =>
        this.authResolver.isAuthorized(
          `createSpecificMember_Vo_Candidate_List<User>_SpecificUserType_List<Group>_policy`,
          [vo]
        ),
    ],
    ['organizations-attributes', () => true],
    [
      'organizations-statistics',
      (vo) =>
        this.authResolver.isAuthorized('getMembersCount_Vo_Status_policy', [vo]) &&
        this.authResolver.isAuthorized('getMembersCount_Vo_policy', [vo]),
    ],
    [
      'organizations-settings',
      (vo) =>
        this.authResolver.isManagerPagePrivileged(vo) ||
        this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [vo]) ||
        this.authResolver.isThisVoAdminOrObserver(vo.id),
    ],
    ['organizations-settings-expiration', (vo) => this.authResolver.isThisVoAdminOrObserver(vo.id)],
    ['organizations-settings-managers', (vo) => this.authResolver.isManagerPagePrivileged(vo)],
    [
      'organizations-settings-applicationForm',
      (vo) => this.authResolver.isThisVoAdminOrObserver(vo.id),
    ],
    [
      'organizations-settings-notifications',
      (vo) => this.authResolver.isThisVoAdminOrObserver(vo.id),
    ],
    [
      'organizations-settings-extsources',
      (vo) => this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [vo]),
    ],
  ]);

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
