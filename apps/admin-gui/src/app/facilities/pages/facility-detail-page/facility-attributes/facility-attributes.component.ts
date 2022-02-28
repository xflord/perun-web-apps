import { Component, HostBinding, OnInit } from '@angular/core';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Facility } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-facility-attributes',
  templateUrl: './facility-attributes.component.html',
  styleUrls: ['./facility-attributes.component.scss'],
})
export class FacilityAttributesComponent implements OnInit {
  @HostBinding('class.router-component') true;

  facility: Facility;
  facilityUserAttAuth: boolean;

  constructor(
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.facility = this.entityStorageService.getEntity();
    this.facilityUserAttAuth = this.authResolver.isAuthorized('getAssignedUsers_Facility_policy', [
      this.facility,
    ]);
  }
}
