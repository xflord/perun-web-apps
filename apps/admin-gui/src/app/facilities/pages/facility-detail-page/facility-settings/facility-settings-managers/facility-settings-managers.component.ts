import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-facility-settings-managers',
  templateUrl: './facility-settings-managers.component.html',
  styleUrls: ['./facility-settings-managers.component.scss'],
})
export class FacilitySettingsManagersComponent implements OnInit {
  @HostBinding('class.router-component') true;

  @Input()
  disableRouting = false;
  @Input()
  disableSelf = false;

  facility: Facility;

  availableRoles: string[] = [];

  selected = 'user';

  type = 'Facility';

  theme = 'facility-theme';

  constructor(
    private facilityService: FacilitiesManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.facility = this.entityStorageService.getEntity();
    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Facility');
  }
}
