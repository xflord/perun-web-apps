import { Component, HostBinding, OnInit } from '@angular/core';
import { SideMenuService } from '../../../../../core/services/common/side-menu.service';
import { Router } from '@angular/router';
import { MenuItem, RPCError } from '@perun-web-apps/perun/models';
import {
  AttributesManagerService,
  Group,
  GroupsManagerService,
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
  selector: 'app-group-settings-overview',
  templateUrl: './group-settings-overview.component.html',
  styleUrls: ['./group-settings-overview.component.scss'],
})
export class GroupSettingsOverviewComponent implements OnInit {
  @HostBinding('class.router-component') true;
  items: MenuItem[] = [];
  group: Group;
  loading = false;

  constructor(
    private sideMenuService: SideMenuService,
    private groupService: GroupsManagerService,
    protected router: Router,
    private guiAuthResolver: GuiAuthResolver,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private notificator: NotificatorService,
    private entityStorageService: EntityStorageService,
    private routePolicyService: RoutePolicyService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.group = this.entityStorageService.getEntity();
    this.initItems();
    this.loading = false;
  }

  private initItems(): void {
    this.items = [];

    // FIXME - manage via canNavigate - problem with async call in route-policy.service.ts
    //not implemented in authorization....probably must be hardcoded
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager
      .getGroupAttributeByName(this.group.id, Urns.GROUP_DEF_EXPIRATION_RULES)
      .subscribe(
        () => {
          this.items.push({
            cssIcon: 'perun-group',
            url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/expiration`,
            label: 'MENU_ITEMS.GROUP.EXPIRATION',
            style: 'group-btn',
          });
        },
        (error: RPCError) => {
          if (error.name !== 'HttpErrorResponse') {
            this.notificator.showRPCError(error);
          }
        }
      );

    if (this.routePolicyService.canNavigate('groups-settings-managers', this.group)) {
      this.items.push({
        cssIcon: 'perun-manager',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/managers`,
        label: 'MENU_ITEMS.GROUP.MANAGERS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-settings-applicationForm', this.group)) {
      this.items.push({
        cssIcon: 'perun-application-form',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/applicationForm`,
        label: 'MENU_ITEMS.GROUP.APPLICATION_FORM',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-settings-notifications', this.group)) {
      this.items.push({
        cssIcon: 'perun-notification',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/notifications`,
        label: 'MENU_ITEMS.GROUP.NOTIFICATIONS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-settings-relations', this.group)) {
      this.items.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/relations`,
        label: 'MENU_ITEMS.GROUP.RELATIONS',
        style: 'group-btn',
      });
    }

    if (this.routePolicyService.canNavigate('groups-settings-extsources', this.group)) {
      this.items.push({
        cssIcon: 'perun-external-sources',
        url: `/organizations/${this.group.voId}/groups/${this.group.id}/settings/extsources`,
        label: 'MENU_ITEMS.GROUP.EXTSOURCES',
        style: 'group-btn',
      });
    }
  }
}
