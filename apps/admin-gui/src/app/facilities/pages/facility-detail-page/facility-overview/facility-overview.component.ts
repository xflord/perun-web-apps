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
  navItems: MenuItem[] = [];
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
    this.initItems();
    this.loading = false;
  }

  private initItems(): void {
    this.navItems = [];

    // Resources
    if (this.routePolicyService.canNavigate('facilities-resources', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-manage-facility',
        url: `/facilities/${this.facility.id}/resources`,
        label: 'MENU_ITEMS.FACILITY.RESOURCES',
        style: 'facility-btn',
      });
    }
    // Allowed users
    if (this.routePolicyService.canNavigate('facilities-allowed-users', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `/facilities/${this.facility.id}/allowed-users`,
        label: 'MENU_ITEMS.FACILITY.ALLOWED_USERS',
        style: 'facility-btn',
      });
    }
    // Allowed groups
    if (this.routePolicyService.canNavigate('facilities-allowed-groups', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `/facilities/${this.facility.id}/allowed-groups`,
        label: 'MENU_ITEMS.FACILITY.ALLOWED_GROUPS',
        style: 'facility-btn',
      });
    }
    // Service state
    if (this.routePolicyService.canNavigate('facilities-services-status', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-service-status',
        url: `/facilities/${this.facility.id}/services-status`,
        label: 'MENU_ITEMS.FACILITY.SERVICES_STATUS',
        style: 'facility-btn',
      });
    }
    // Service destination
    if (this.routePolicyService.canNavigate('facilities-services-destinations', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-service_destination',
        url: `/facilities/${this.facility.id}/services-destinations`,
        label: 'MENU_ITEMS.FACILITY.SERVICES_DESTINATIONS',
        style: 'facility-btn',
      });
    }
    // Hosts
    if (this.routePolicyService.canNavigate('facilities-hosts', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-hosts',
        url: `/facilities/${this.facility.id}/hosts`,
        label: 'MENU_ITEMS.FACILITY.HOSTS',
        style: 'facility-btn',
      });
    }
    // Attributes
    if (this.routePolicyService.canNavigate('facilities-attributes', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-attributes',
        url: `/facilities/${this.facility.id}/attributes`,
        label: 'MENU_ITEMS.FACILITY.ATTRIBUTES',
        style: 'facility-btn',
      });
    }

    // Settings
    if (this.routePolicyService.canNavigate('facilities-settings', this.facility)) {
      this.navItems.push({
        cssIcon: 'perun-settings2',
        url: `/facilities/${this.facility.id}/settings`,
        label: 'MENU_ITEMS.FACILITY.SETTINGS',
        style: 'facility-btn',
      });
    }
  }
}
