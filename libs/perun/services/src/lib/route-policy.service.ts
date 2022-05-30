import { Injectable } from '@angular/core';
import {
  AttributesManagerService,
  Facility,
  Group,
  Member,
  Resource,
  User,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from './gui-auth-resolver.service';
import { Urns } from '@perun-web-apps/perun/urns';
import { NotificatorService } from './notificator.service';
import { ApiRequestConfigurationService } from './api-request-configuration.service';
import { Router } from '@angular/router';

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
    // Organizations
    [
      //FIXME: due to SELF role in policy_roles on BE everyone can access /organizations/:voId now
      'organizations', // route for /organizations/:voId
      (vo): boolean => this.authResolver.isAuthorized('getEnrichedVoById_int_policy', [vo]),
    ],
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
    [
      'organizations-attributes',
      (vo): boolean => this.authResolver.isAuthorized('getEnrichedVoById_int_policy', [vo]),
    ],
    [
      'organizations-statistics',
      (vo): boolean =>
        this.authResolver.isAuthorized('getMembersCount_Vo_Status_policy', [vo]) &&
        this.authResolver.isAuthorized('getMembersCount_Vo_policy', [vo]),
    ],
    [
      'organizations-settings',
      (vo): boolean =>
        this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [vo]) ||
        this.authResolver.isManagerPagePrivileged(vo) ||
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
    ['organizations-settings-memberOrganizations', (): boolean => this.authResolver.isPerunAdmin()],
    [
      'organizations-settings-hierarchicalInclusion',
      (): boolean => this.authResolver.isPerunAdmin(),
    ],
    // Members
    [
      'members', // route for /members/:memberId
      (member): boolean =>
        this.authResolver.isAuthorized('getRichMemberWithAttributes_Member_policy', [member]),
    ],
    [
      'members-groups',
      (member): boolean =>
        this.authResolver.isAuthorized('getMemberGroups_Member_policy', [member]),
    ],
    [
      'members-applications',
      (member): boolean =>
        this.authResolver.isAuthorized('vo-getApplicationsForMember_Group_Member_policy', [member]),
    ],
    [
      'members-resources',
      (member): boolean =>
        this.authResolver.isAuthorized('getAssignedRichResources_Member_policy', [member]),
    ],
    [
      'members-attributes',
      (member): boolean =>
        this.authResolver.isAuthorized('getRichMemberWithAttributes_Member_policy', [member]),
    ],
    // Groups
    [
      //FIXME: due to SELF role in policy_roles on BE everyone can access /groups/:groupId now
      'groups', // route for /groups/:groupId
      (group): boolean => this.authResolver.isAuthorized('getGroupById_int_policy', [group]),
    ],
    [
      'groups-members',
      (group): boolean =>
        this.authResolver.isAuthorized(
          'group-getMembersPage_Vo_MembersPageQuery_List<String>_policy',
          [group]
        ),
    ],
    [
      'groups-subgroups',
      (group): boolean =>
        this.authResolver.isAuthorized(
          'getAllRichSubGroupsWithAttributesByNames_Group_List<String>_policy',
          [group]
        ),
    ],
    [
      'groups-resources',
      (group): boolean =>
        this.authResolver.isAuthorized('getAssignedRichResources_Group_policy', [group]),
    ],
    [
      'groups-applications',
      (group): boolean =>
        this.authResolver.isAuthorized('getApplicationsForGroup_Group_List<String>_policy', [
          group,
        ]),
    ],
    [
      'groups-attributes',
      (group): boolean => this.authResolver.isAuthorized('getGroupById_int_policy', [group]),
    ],
    [
      'groups-statistics',
      (group): boolean =>
        this.authResolver.isAuthorized('getGroupMembersCount_Group_policy', [group]) &&
        this.authResolver.isAuthorized('getGroupMembersCountsByVoStatus_Group_policy', [group]) &&
        this.authResolver.isAuthorized('getGroupMembersCountsByGroupStatus_Group_policy', [group]),
    ],
    [
      'groups-settings',
      (group): boolean =>
        this.authResolver.isManagerPagePrivileged(group) ||
        this.authResolver.isAuthorized('group-getFormItems_ApplicationForm_AppType_policy', [
          group,
        ]) ||
        this.authResolver.isAuthorized('getGroupUnions_Group_boolean_policy', [group]) ||
        this.authResolver.isAuthorized('getGroupExtSources_Group_policy', [group]),
      //FIXME: groups-settings-expiration auth is not involved
    ],
    [
      'groups-settings-managers',
      (group): boolean => this.authResolver.isManagerPagePrivileged(group),
    ],
    [
      'groups-settings-applicationForm',
      (group): boolean =>
        this.authResolver.isAuthorized('group-getFormItems_ApplicationForm_AppType_policy', [
          group,
        ]),
    ],
    [
      'groups-settings-notifications',
      (group): boolean =>
        this.authResolver.isAuthorized('group-getFormItems_ApplicationForm_AppType_policy', [
          group,
        ]),
    ],
    [
      'groups-settings-relations',
      (group): boolean =>
        this.authResolver.isAuthorized('getGroupUnions_Group_boolean_policy', [group]),
    ],
    [
      'groups-settings-extsources',
      (group): boolean =>
        this.authResolver.isAuthorized('getGroupExtSources_Group_policy', [group]),
    ],
    //not implemented in authorization....probably must be hardcoded
    //FIXME probably not the best solution - firstly returns true and renavigates on possible async error
    [
      'groups-settings-expiration',
      (group): boolean => {
        this.apiRequest.dontHandleErrorForNext();
        this.attributesManager
          .getGroupAttributeByName(group.id, Urns.GROUP_DEF_EXPIRATION_RULES)
          .subscribe(
            () => {
              // do nothing - routing will be successfull
            },
            () => {
              this.notificator.showRouteError();
              void this.router.navigate(['/notAuthorized']);
            }
          );
        return true;
      },
    ],
    // Resources
    [
      'resources', // route for /resources/:resourceId
      (resource): boolean =>
        this.authResolver.isAuthorized('getRichResourceById_int_policy', [resource]),
    ],
    [
      'resources-groups',
      (resource): boolean =>
        this.authResolver.isAuthorized('getAssignedGroups_Resource_policy', [resource]),
    ],
    [
      'resources-services',
      (resource): boolean =>
        this.authResolver.isAuthorized('getAssignedServices_Resource_policy', [resource]),
    ],
    [
      'resources-members',
      (resource): boolean =>
        this.authResolver.isAuthorized('getAssignedMembers_Resource_policy', [resource]),
    ],
    [
      'resources-tags',
      (resource): boolean =>
        this.authResolver.isAuthorized('getAllResourcesTagsForResource_Resource_policy', [
          resource,
        ]),
    ],
    [
      'resources-attributes',
      (resource): boolean =>
        this.authResolver.isAuthorized('getRichResourceById_int_policy', [resource]),
    ],
    [
      'resources-settings',
      (resource): boolean => this.authResolver.isManagerPagePrivileged(resource),
    ],
    [
      'resources-settings-managers',
      (resource): boolean => this.authResolver.isManagerPagePrivileged(resource),
    ],
    // Facilities
    [
      'facilities', // route for /facilities/:facilityId
      (facility): boolean =>
        this.authResolver.isAuthorized('getFacilityById_int_policy', [facility]),
    ],
    [
      'facilities-resources',
      (facility): boolean =>
        this.authResolver.isAuthorized('getAssignedRichResources_Facility_policy', [facility]),
    ],
    [
      'facilities-allowed-users',
      (facility): boolean =>
        this.authResolver.isAuthorized('getAssignedUsers_Facility_Service_policy', [facility]),
    ],
    [
      'facilities-allowed-groups',
      (facility): boolean =>
        this.authResolver.isAuthorized('getAllowedGroups_Facility_Vo_Service_policy', [facility]),
    ],
    [
      'facilities-services-status',
      (facility): boolean =>
        this.authResolver.isAuthorized('getFacilityServicesState_Facility_policy', [facility]),
    ],
    [
      'services-status', // route for /facilities/:facilityId/services-status/:taskId
      (facility): boolean =>
        this.authResolver.isAuthorized('getTaskResultsByTask_int_policy', [facility]),
    ],
    [
      'facilities-services-destinations',
      (facility): boolean =>
        this.authResolver.isAuthorized('getAllRichDestinations_Facility_policy', [facility]),
    ],
    // TODO fix when policies are updated
    ['facilities-hosts', (): boolean => this.authResolver.isFacilityAdmin()],
    [
      'facilities-attributes',
      (facility): boolean =>
        this.authResolver.isAuthorized('getFacilityById_int_policy', [facility]),
    ],
    [
      'facilities-settings',
      (facility): boolean =>
        this.authResolver.isAuthorized('getOwners_Facility_policy', [facility]) ||
        this.authResolver.isManagerPagePrivileged(facility) ||
        this.authResolver.isAuthorized('getAssignedSecurityTeams_Facility_policy', [facility]) ||
        this.authResolver.isAuthorized('getBansForFacility_int_policy', [facility]),
    ],
    [
      'facilities-settings-owners',
      (facility): boolean =>
        this.authResolver.isAuthorized('getOwners_Facility_policy', [facility]),
    ],
    [
      'facilities-settings-managers',
      (facility): boolean => this.authResolver.isManagerPagePrivileged(facility),
    ],
    [
      'facilities-settings-security-teams',
      (facility): boolean =>
        this.authResolver.isAuthorized('getAssignedSecurityTeams_Facility_policy', [facility]),
    ],
    [
      'facilities-settings-blacklist',
      (facility): boolean =>
        this.authResolver.isAuthorized('getBansForFacility_int_policy', [facility]),
    ],
  ]);

  constructor(
    private authResolver: GuiAuthResolver,
    private attributesManager: AttributesManagerService,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService,
    private router: Router
  ) {}

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
    // Perun admin section
    if (key.startsWith('admin') || key.startsWith('identities')) {
      return this.authResolver.isPerunAdminOrObserver();
    }

    // route for /facilities
    if (key === 'facilities' && entity.id === -1) {
      return this.authResolver.canManageFacilities();
    }

    const authorize: (e: Entity) => boolean = this.routePolicies.get(key);
    return authorize ? authorize(entity) : true;
  }
}
