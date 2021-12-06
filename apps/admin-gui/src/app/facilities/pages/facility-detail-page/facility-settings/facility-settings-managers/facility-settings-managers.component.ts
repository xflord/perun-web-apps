import { Component, HostBinding, OnInit } from '@angular/core';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-facility-settings-managers',
  templateUrl: './facility-settings-managers.component.html',
  styleUrls: ['./facility-settings-managers.component.scss']
})
export class FacilitySettingsManagersComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private facilityService: FacilitiesManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) { }

  facility: Facility;

  availableRoles: string[] = [];

  selected = 'user';

  type = 'Facility';

  theme = 'facility-theme';

  ngOnInit() {
    this.facility = this.entityStorageService.getEntity();
    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Facility');
  }
}
