import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import {
  EntityStorageService,
  GuiAuthResolver,
  RoutePolicyService,
} from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-overview',
  templateUrl: './facility-overview.component.html',
  styleUrls: ['./facility-overview.component.scss'],
})
export class FacilityOverviewComponent implements OnInit {
  // class used for animation
  @HostBinding('class.router-component') true;
  items: MenuItem[] = [];
  settingItems: MenuItem[] = [];
  facility: Facility;
  loading = false;

  constructor(
    private facilityManager: FacilitiesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private routePolicyService: RoutePolicyService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.facility = this.entityStorageService.getEntity();
    this.setItems();
    this.setSettingsItems();
    this.loading = false;
  }

  private setItems(): void {
    this.items = [];

    // Resources
    if (this.routePolicyService.canNavigate('facilities-resources', this.facility)) {
      this.items.push({
        cssIcon: 'perun-manage-facility',
        url: `/facilities/${this.facility.id}/resources`,
        label: 'MENU_ITEMS.FACILITY.RESOURCES',
        style: 'facility-btn',
      });
    }
    // Allowed users
    if (this.routePolicyService.canNavigate('facilities-allowed-users', this.facility)) {
      this.items.push({
        cssIcon: 'perun-user',
        url: `/facilities/${this.facility.id}/allowed-users`,
        label: 'MENU_ITEMS.FACILITY.ALLOWED_USERS',
        style: 'facility-btn',
      });
    }
    // Allowed groups
    if (this.routePolicyService.canNavigate('facilities-allowed-groups', this.facility)) {
      this.items.push({
        cssIcon: 'perun-group',
        url: `/facilities/${this.facility.id}/allowed-groups`,
        label: 'MENU_ITEMS.FACILITY.ALLOWED_GROUPS',
        style: 'facility-btn',
      });
    }
    // Service state
    if (this.routePolicyService.canNavigate('facilities-services-status', this.facility)) {
      this.items.push({
        cssIcon: 'perun-service-status',
        url: `/facilities/${this.facility.id}/services-status`,
        label: 'MENU_ITEMS.FACILITY.SERVICES_STATUS',
        style: 'facility-btn',
      });
    }
    // Service destination
    if (this.routePolicyService.canNavigate('facilities-services-destinations', this.facility)) {
      this.items.push({
        cssIcon: 'perun-service_destination',
        url: `/facilities/${this.facility.id}/services-destinations`,
        label: 'MENU_ITEMS.FACILITY.SERVICES_DESTINATIONS',
        style: 'facility-btn',
      });
    }
    // Hosts
    if (this.routePolicyService.canNavigate('facilities-hosts', this.facility)) {
      this.items.push({
        cssIcon: 'perun-hosts',
        url: `/facilities/${this.facility.id}/hosts`,
        label: 'MENU_ITEMS.FACILITY.HOSTS',
        style: 'facility-btn',
      });
    }
    // Attributes
    if (this.routePolicyService.canNavigate('facilities-attributes', this.facility)) {
      this.items.push({
        cssIcon: 'perun-attributes',
        url: `/facilities/${this.facility.id}/attributes`,
        label: 'MENU_ITEMS.FACILITY.ATTRIBUTES',
        style: 'facility-btn',
      });
    }
  }

  private setSettingsItems(): void {
    this.settingItems = [];

    // Owners
    if (this.routePolicyService.canNavigate('facilities-settings-owners', this.facility)) {
      this.settingItems.push({
        cssIcon: 'perun-owner-grey',
        url: `/facilities/${this.facility.id}/settings/owners`,
        label: 'MENU_ITEMS.FACILITY.OWNERS',
        style: 'facility-btn',
      });
    }
    // Managers
    if (this.routePolicyService.canNavigate('facilities-settings-managers', this.facility)) {
      this.settingItems.push({
        cssIcon: 'perun-manager',
        url: `/facilities/${this.facility.id}/settings/managers`,
        label: 'MENU_ITEMS.FACILITY.MANAGERS',
        style: 'facility-btn',
      });
    }
    // Security teams
    if (this.routePolicyService.canNavigate('facilities-settings-security-teams', this.facility)) {
      this.settingItems.push({
        cssIcon: 'perun-security-teams',
        url: `/facilities/${this.facility.id}/settings/security-teams`,
        label: 'MENU_ITEMS.FACILITY.SECURITY_TEAMS',
        style: 'facility-btn',
      });
    }
    // Blacklist
    if (this.routePolicyService.canNavigate('facilities-settings-blacklist', this.facility)) {
      this.settingItems.push({
        cssIcon: 'perun-black-list',
        url: `/facilities/${this.facility.id}/settings/blacklist`,
        label: 'MENU_ITEMS.FACILITY.BLACKLIST',
        style: 'facility-btn',
      });
    }
    // Bans
    if (this.routePolicyService.canNavigate('facilities-settings-bans', this.facility)) {
      this.settingItems.push({
        cssIcon: 'perun-ban',
        url: `/facilities/${this.facility.id}/settings/bans`,
        label: 'MENU_ITEMS.FACILITY.BANS',
        style: 'facility-btn',
      });
    }
  }
}
