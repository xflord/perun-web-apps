import { Component, DoCheck, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { SideMenuService } from '../../../../core/services/common/side-menu.service';
import { Router } from '@angular/router';
import {
  EntityStorageService,
  GuiAuthResolver,
  RoutePolicyService,
} from '@perun-web-apps/perun/services';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-vo-overview',
  templateUrl: './vo-overview.component.html',
  styleUrls: ['./vo-overview.component.scss'],
})
export class VoOverviewComponent implements OnInit, DoCheck {
  // @HostBinding('class.router-component') true;

  vo: Vo;
  items: MenuItem[] = [];
  resourcesItems: MenuItem[] = [];
  settingsItems: MenuItem[] = [];
  memberOrganization = false;
  loading = false;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    protected router: Router,
    protected authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private routePolicyService: RoutePolicyService
  ) {}

  ngDoCheck(): void {
    const currentVoId = this.vo.id;
    this.vo = this.entityStorageService.getEntity();
    if (currentVoId !== this.vo.id) {
      this.refresh();
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.refresh();
  }

  private refresh(): void {
    this.loading = true;
    this.voService.getEnrichedVoById(this.vo.id).subscribe((enrichedVo) => {
      this.memberOrganization = enrichedVo.parentVos.length !== 0;
      this.setItems();
      this.setResourceItems();
      this.setSettingsItems();
      this.loading = false;
    });
  }

  private setItems(): void {
    this.items = [];

    // Members
    if (this.routePolicyService.canNavigate('organizations-members', this.vo)) {
      this.items.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.vo.id}/members`,
        label: 'MENU_ITEMS.VO.MEMBERS',
        style: 'vo-btn',
      });
    }

    // Groups
    if (this.routePolicyService.canNavigate('organizations-groups', this.vo)) {
      this.items.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.vo.id}/groups`,
        label: 'MENU_ITEMS.VO.GROUPS',
        style: 'vo-btn',
      });
    }

    // Applications
    if (this.routePolicyService.canNavigate('organizations-applications', this.vo)) {
      this.items.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.vo.id}/applications`,
        label: 'MENU_ITEMS.VO.APPLICATIONS',
        style: 'vo-btn',
      });
    }

    // Sponsored members
    if (this.routePolicyService.canNavigate('organizations-sponsoredMembers', this.vo)) {
      this.items.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.vo.id}/sponsoredMembers`,
        label: 'MENU_ITEMS.VO.SPONSORED_MEMBERS',
        style: 'vo-btn',
      });
    }

    // Service members
    if (this.routePolicyService.canNavigate('organizations-serviceAccounts', this.vo)) {
      this.items.push({
        cssIcon: 'perun-service-identity',
        url: `/organizations/${this.vo.id}/serviceAccounts`,
        label: 'MENU_ITEMS.VO.SERVICE_MEMBERS',
        style: 'vo-btn',
      });
    }

    // Attributes
    if (this.routePolicyService.canNavigate('organizations-attributes', this.vo)) {
      this.items.push({
        cssIcon: 'perun-attributes',
        url: `/organizations/${this.vo.id}/attributes`,
        label: 'MENU_ITEMS.VO.ATTRIBUTES',
        style: 'vo-btn',
      });
    }

    // Statistics
    if (this.routePolicyService.canNavigate('organizations-statistics', this.vo)) {
      this.items.push({
        cssIcon: 'perun-statistics',
        url: `/organizations/${this.vo.id}/statistics`,
        label: 'MENU_ITEMS.VO.STATISTICS',
        style: 'vo-btn',
      });
    }
  }

  private setResourceItems(): void {
    this.resourcesItems = [];

    // Resources
    if (this.routePolicyService.canNavigate('organizations-resources-preview', this.vo)) {
      this.resourcesItems.push({
        cssIcon: 'perun-resource',
        url: `/organizations/${this.vo.id}/resources/preview`,
        label: 'MENU_ITEMS.VO.RESOURCE_PREVIEW',
        style: 'vo-btn',
      });
    }

    // Resource tags
    if (this.routePolicyService.canNavigate('organizations-resources-tags', this.vo)) {
      this.resourcesItems.push({
        cssIcon: 'perun-resource-tags',
        url: `/organizations/${this.vo.id}/resources/tags`,
        label: 'MENU_ITEMS.VO.RESOURCE_TAGS',
        style: 'vo-btn',
      });
    }

    // Resource states
    if (this.routePolicyService.canNavigate('organizations-resources-states', this.vo)) {
      this.resourcesItems.push({
        cssIcon: 'perun-resources-state',
        url: `/organizations/${this.vo.id}/resources/states`,
        label: 'MENU_ITEMS.VO.RESOURCE_STATES',
        style: 'vo-btn',
      });
    }
  }

  private setSettingsItems(): void {
    this.settingsItems = [];

    // Membership
    if (this.routePolicyService.canNavigate('organizations-settings-expiration', this.vo)) {
      this.settingsItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.vo.id}/settings/expiration`,
        label: 'MENU_ITEMS.VO.EXPIRATION',
        style: 'vo-btn',
      });
    }

    // Managers
    if (this.routePolicyService.canNavigate('organizations-settings-managers', this.vo)) {
      this.settingsItems.push({
        cssIcon: 'perun-manager',
        url: `/organizations/${this.vo.id}/settings/managers`,
        label: 'MENU_ITEMS.VO.MANAGERS',
        style: 'vo-btn',
      });
    }

    // Application forms
    if (this.routePolicyService.canNavigate('organizations-settings-applicationForm', this.vo)) {
      this.settingsItems.push({
        cssIcon: 'perun-application-form',
        url: `/organizations/${this.vo.id}/settings/applicationForm`,
        label: 'MENU_ITEMS.VO.APPLICATION_FORM',
        style: 'vo-btn',
      });
    }

    // Notifications
    if (this.routePolicyService.canNavigate('organizations-settings-notifications', this.vo)) {
      this.settingsItems.push({
        cssIcon: 'perun-notification',
        url: `/organizations/${this.vo.id}/settings/notifications`,
        label: 'MENU_ITEMS.VO.NOTIFICATIONS',
        style: 'vo-btn',
      });
    }

    // Ext sources
    if (this.routePolicyService.canNavigate('organizations-settings-extsources', this.vo)) {
      this.settingsItems.push({
        cssIcon: 'perun-external-sources',
        url: `/organizations/${this.vo.id}/settings/extsources`,
        label: 'MENU_ITEMS.VO.EXTSOURCES',
        style: 'vo-btn',
      });
    }

    // Member organizations
    if (
      this.routePolicyService.canNavigate('organizations-settings-memberOrganizations', this.vo)
    ) {
      this.settingsItems.push({
        cssIcon: 'perun-hierarchical-vo',
        url: `/organizations/${this.vo.id}/settings/memberOrganizations`,
        label: 'MENU_ITEMS.VO.MEMBER_ORGANIZATIONS',
        style: 'vo-btn',
      });
    }

    // Hierarchical inclusion
    if (
      this.routePolicyService.canNavigate(
        'organizations-settings-hierarchicalInclusion',
        this.vo
      ) &&
      this.memberOrganization
    ) {
      this.settingsItems.push({
        cssIcon: 'perun-hierarchical-inclusion',
        url: `/organizations/${this.vo.id}/settings/hierarchicalInclusion`,
        label: 'MENU_ITEMS.VO.HIERARCHICAL_INCLUSION',
        style: 'vo-btn',
      });
    }

    // Bans
    if (this.routePolicyService.canNavigate('organizations-settings-bans', this.vo)) {
      this.settingsItems.push({
        cssIcon: 'perun-ban',
        url: `/organizations/${this.vo.id}/settings/bans`,
        label: 'MENU_ITEMS.VO.BANS',
        style: 'vo-btn',
      });
    }
  }
}
