import { Component, DoCheck, HostBinding, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.component.html',
  styleUrls: ['./group-overview.component.scss'],
})
export class GroupOverviewComponent implements OnInit, DoCheck {
  // used for router animation
  @HostBinding('class.router-component') true;
  items: MenuItem[] = [];
  settingsItems: MenuItem[] = [];
  group: Group;
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

  ngDoCheck(): void {
    const currentGroupId = this.group.id;
    this.group = this.entityStorageService.getEntity();
    if (currentGroupId !== this.group.id) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.group = this.entityStorageService.getEntity();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.setItems();
    this.setSettingsItems();
    this.loading = false;
  }

  private setItems(): void {
    this.items = [];

    if (this.routePolicyService.canNavigate('groups-members', this.group)) {
      this.items.push({
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
      this.items.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/subgroups`,
        label: 'MENU_ITEMS.GROUP.SUBGROUPS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-resources', this.group)) {
      this.items.push({
        cssIcon: 'perun-manage-facility',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/resources`,
        label: 'MENU_ITEMS.GROUP.RESOURCES',
        style: 'group-btn',
      });
    }

    if (
      this.group.name !== 'members' &&
      this.routePolicyService.canNavigate('groups-applications', this.group)
    ) {
      this.items.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/applications`,
        label: 'MENU_ITEMS.GROUP.APPLICATIONS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-attributes', this.group)) {
      this.items.push({
        cssIcon: 'perun-attributes',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/attributes`,
        label: 'MENU_ITEMS.GROUP.ATTRIBUTES',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-statistics', this.group)) {
      this.items.push({
        cssIcon: 'perun-statistics',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/statistics`,
        label: 'MENU_ITEMS.GROUP.STATISTICS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-roles', this.group)) {
      this.items.push({
        cssIcon: 'perun-roles',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/roles`,
        label: 'MENU_ITEMS.GROUP.ROLES',
        style: 'group-btn',
      });
    }
  }

  private setSettingsItems(): void {
    this.settingsItems = [];

    // FIXME - manage via canNavigate - problem with async call in route-policy.service.ts
    //not implemented in authorization....probably must be hardcoded
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager
      .getGroupAttributeByName(this.group.id, Urns.GROUP_DEF_EXPIRATION_RULES)
      .subscribe({
        next: () => {
          this.settingsItems = [
            {
              cssIcon: 'perun-group',
              url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/expiration`,
              label: 'MENU_ITEMS.GROUP.EXPIRATION',
              style: 'group-btn',
            },
            ...this.settingsItems,
          ];
          this.loading = false;
        },
        error: (error: RPCError) => {
          if (error.name !== 'PrivilegeException') {
            this.notificator.showRPCError(error);
          }
          this.loading = false;
        },
      });

    if (this.routePolicyService.canNavigate('groups-settings-managers', this.group)) {
      this.settingsItems.push({
        cssIcon: 'perun-manager',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/managers`,
        label: 'MENU_ITEMS.GROUP.MANAGERS',
        style: 'group-btn',
      });
    }

    if (
      this.group.name !== 'members' &&
      this.routePolicyService.canNavigate('groups-settings-applicationForm', this.group)
    ) {
      this.settingsItems.push({
        cssIcon: 'perun-application-form',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/applicationForm`,
        label: 'MENU_ITEMS.GROUP.APPLICATION_FORM',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-settings-notifications', this.group)) {
      this.settingsItems.push({
        cssIcon: 'perun-notification',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/notifications`,
        label: 'MENU_ITEMS.GROUP.NOTIFICATIONS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-settings-extsources', this.group)) {
      this.settingsItems.push({
        cssIcon: 'perun-external-sources',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/extsources`,
        label: 'MENU_ITEMS.GROUP.EXTSOURCES',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-settings-relations', this.group)) {
      this.settingsItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/relations`,
        label: 'MENU_ITEMS.GROUP.RELATIONS',
        style: 'group-btn',
      });
    }
  }
}
