import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuItem, RPCError } from '@perun-web-apps/perun/models';
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
  RoutePolicyService,
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
  navItems: MenuItem[] = [];
  group: Group;
  parentGroup: Group = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupsManagerService,
    private voService: VosManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private notificator: NotificatorService,
    private entityStorageService: EntityStorageService,
    private routePolicyService: RoutePolicyService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.route.params.subscribe((params) => {
      const voId = Number(params['voId']);
      const groupId = Number(params['groupId']);
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

  private loadParentGroupData(id?: number): void {
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

  private initNavItems(): void {
    this.navItems = [];

    if (this.routePolicyService.canNavigate('groups-members', this.group)) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/members`,
        label: 'MENU_ITEMS.GROUP.MEMBERS',
        style: 'group-btn',
      });
    }

    if (
      this.routePolicyService.canNavigate('groups-subgroups', this.group) &&
      this.group.name !== 'members'
    ) {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/subgroups`,
        label: 'MENU_ITEMS.GROUP.SUBGROUPS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-resources', this.group)) {
      this.navItems.push({
        cssIcon: 'perun-manage-facility',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/resources`,
        label: 'MENU_ITEMS.GROUP.RESOURCES',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-applications', this.group)) {
      this.navItems.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/applications`,
        label: 'MENU_ITEMS.GROUP.APPLICATIONS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-attributes', this.group)) {
      this.navItems.push({
        cssIcon: 'perun-attributes',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/attributes`,
        label: 'MENU_ITEMS.GROUP.ATTRIBUTES',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-statistics', this.group)) {
      this.navItems.push({
        cssIcon: 'perun-statistics',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/statistics`,
        label: 'MENU_ITEMS.GROUP.STATISTICS',
        style: 'group-btn',
      });
    }

    // FIXME - manage via canNavigate - problem with async call in route-policy.service.ts
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
        (error: RPCError) => {
          if (error.name !== 'HttpErrorResponse') {
            this.notificator.showRPCError(error);
          }
        }
      );

    if (expirationAuth || this.routePolicyService.canNavigate('groups-settings', this.group)) {
      this.navItems.push({
        cssIcon: 'perun-settings2',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings`,
        label: 'MENU_ITEMS.GROUP.SETTINGS',
        style: 'group-btn',
      });
    }
  }
}
