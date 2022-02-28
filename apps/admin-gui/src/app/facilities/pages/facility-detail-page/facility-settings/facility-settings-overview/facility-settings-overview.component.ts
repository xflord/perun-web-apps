import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-settings-overview',
  templateUrl: './facility-settings-overview.component.html',
  styleUrls: ['./facility-settings-overview.component.scss'],
})
export class FacilitySettingsOverviewComponent implements OnInit {
  @HostBinding('class.router-component') true;

  items: MenuItem[] = [];
  facility: Facility;
  loading = false;

  constructor(
    private facilityManager: FacilitiesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.facility = this.entityStorageService.getEntity();
    this.initItems();
    this.loading = false;
  }

  private initItems(): void {
    this.items = [];

    // Owners
    if (this.authResolver.isAuthorized('getOwners_Facility_policy', [this.facility])) {
      this.items.push({
        cssIcon: 'perun-owner-grey',
        url: `/facilities/${this.facility.id}/settings/owners`,
        label: 'MENU_ITEMS.FACILITY.OWNERS',
        style: 'facility-btn',
      });
    }
    // Managers
    if (this.authResolver.isManagerPagePrivileged(this.facility)) {
      this.items.push({
        cssIcon: 'perun-manager',
        url: `/facilities/${this.facility.id}/settings/managers`,
        label: 'MENU_ITEMS.FACILITY.MANAGERS',
        style: 'facility-btn',
      });
    }
    // Security teams
    if (
      this.authResolver.isAuthorized('getAssignedSecurityTeams_Facility_policy', [this.facility])
    ) {
      this.items.push({
        cssIcon: 'perun-security-teams',
        url: `/facilities/${this.facility.id}/settings/security-teams`,
        label: 'MENU_ITEMS.FACILITY.SECURITY_TEAMS',
        style: 'facility-btn',
      });
    }
    // Blacklist
    if (this.authResolver.isAuthorized('getBansForFacility_int_policy', [this.facility])) {
      this.items.push({
        cssIcon: 'perun-black-list',
        url: `/facilities/${this.facility.id}/settings/blacklist`,
        label: 'MENU_ITEMS.FACILITY.BLACKLIST',
        style: 'facility-btn',
      });
    }
  }
}
