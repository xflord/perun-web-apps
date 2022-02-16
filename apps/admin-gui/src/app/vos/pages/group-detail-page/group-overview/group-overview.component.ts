import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { ActivatedRoute } from '@angular/router';
import {
  AttributesManagerService,
  Group,
  GroupsManagerService,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  ApiRequestConfigurationService,
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { addRecentlyVisited, addRecentlyVisitedObject } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.component.html',
  styleUrls: ['./group-overview.component.scss'],
})
export class GroupOverviewComponent implements OnInit {
  // used for router animation
  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupsManagerService,
    private voService: VosManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private notificator: NotificatorService,
    private entityStorageService: EntityStorageService
  ) {}

  navItems: MenuItem[] = [];
  group: Group;
  parentGroup: Group = null;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.route.params.subscribe((params) => {
      const voId = params['voId'];
      const groupId = params['groupId'];
      this.voService.getVoById(voId).subscribe(
        (vo) => {
          this.groupService.getGroupById(groupId).subscribe(
            (group) => {
              this.group = group;
              this.entityStorageService.setEntity({
                id: group.id,
                voId: vo.id,
                parentGroupId: group.parentGroupId,
                beanName: group.beanName,
              });
              addRecentlyVisited('groups', this.group);
              addRecentlyVisitedObject(this.group, vo.name);
              this.loadParentGroupData(this.group.parentGroupId);
              if (this.group.parentGroupId == null) {
                this.parentGroup = null;
                this.initNavItems();
                this.loading = false;
                return;
              }
              this.loading = false;
            },
            () => (this.loading = false)
          );
        },
        () => (this.loading = false)
      );
    });
  }

  private loadParentGroupData(id?: number) {
    if (id == null) return;
    this.groupService.getGroupById(id).subscribe(
      (parentGroup) => {
        this.parentGroup = parentGroup;
        this.initNavItems();
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  private initNavItems() {
    this.navItems = [];

    if (
      this.guiAuthResolver.isAuthorized(
        'getCompleteRichMembers_Group_List<String>_boolean_policy',
        [this.group]
      )
    ) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/members`,
        label: 'MENU_ITEMS.GROUP.MEMBERS',
        style: 'group-btn',
      });
    }

    if (
      this.guiAuthResolver.isAuthorized(
        'getAllRichSubGroupsWithAttributesByNames_Group_List<String>_policy',
        [this.group]
      ) &&
      this.group.name !== 'members'
    ) {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/subgroups`,
        label: 'MENU_ITEMS.GROUP.SUBGROUPS',
        style: 'group-btn',
      });
    }

    if (this.guiAuthResolver.isAuthorized('getAssignedRichResources_Group_policy', [this.group])) {
      this.navItems.push({
        cssIcon: 'perun-manage-facility',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/resources`,
        label: 'MENU_ITEMS.GROUP.RESOURCES',
        style: 'group-btn',
      });
    }

    if (
      this.guiAuthResolver.isAuthorized('getApplicationsForGroup_Group_List<String>_policy', [
        this.group,
      ])
    ) {
      this.navItems.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/applications`,
        label: 'MENU_ITEMS.GROUP.APPLICATIONS',
        style: 'group-btn',
      });
    }

    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `/organizations/${this.group.voId}/groups/${this.group.id}/attributes`,
      label: 'MENU_ITEMS.GROUP.ATTRIBUTES',
      style: 'group-btn',
    });

    const countAuth = this.guiAuthResolver.isAuthorized('getGroupMembersCount_Group_policy', [
      this.group,
    ]);
    const countByVoStatusAuth = this.guiAuthResolver.isAuthorized(
      'getGroupMembersCountsByVoStatus_Group_policy',
      [this.group]
    );
    const countByGroupStatusAuth = this.guiAuthResolver.isAuthorized(
      'getGroupMembersCountsByGroupStatus_Group_policy',
      [this.group]
    );
    if (countAuth && countByGroupStatusAuth && countByVoStatusAuth) {
      this.navItems.push({
        cssIcon: 'perun-statistics',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/statistics`,
        label: 'MENU_ITEMS.GROUP.STATISTICS',
        style: 'group-btn',
      });
    }

    //SettingsMembership
    //not implemented in authorization....probably must be hardcoded
    let expirationAuth = false;
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager
      .getGroupAttributeByName(this.group.id, Urns.GROUP_DEF_EXPIRATION_RULES)
      .subscribe(
        () => {
          expirationAuth = true;
        },
        (error) => {
          if (error.name !== 'HttpErrorResponse') {
            this.notificator.showRPCError(error);
          }
        }
      );

    const managerAuth = this.guiAuthResolver.isManagerPagePrivileged(this.group);
    const appFormAuth = this.guiAuthResolver.isAuthorized(
      'group-getFormItems_ApplicationForm_AppType_policy',
      [this.group]
    );
    const notificationAuth = this.guiAuthResolver.isAuthorized(
      'group-getFormItems_ApplicationForm_AppType_policy',
      [this.group]
    );
    const relationAuth = this.guiAuthResolver.isAuthorized('getGroupUnions_Group_boolean_policy', [
      this.group,
    ]);
    if (expirationAuth || managerAuth || appFormAuth || notificationAuth || relationAuth) {
      this.navItems.push({
        cssIcon: 'perun-settings2',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings`,
        label: 'MENU_ITEMS.GROUP.SETTINGS',
        style: 'group-btn',
      });
    }
  }
}
