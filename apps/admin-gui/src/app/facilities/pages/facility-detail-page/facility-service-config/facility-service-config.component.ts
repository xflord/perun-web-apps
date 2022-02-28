import { Component, OnInit } from '@angular/core';
import {
  FacilitiesManagerService,
  Facility,
  Group,
  MembersManagerService,
  Resource,
  ResourcesManagerService,
  RichMember,
  Service,
  ServicesManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { TranslateService } from '@ngx-translate/core';
import { EntityStorageService } from '@perun-web-apps/perun/services';

export type ServiceSelectValue = 'ALL' | 'NOT_SELECTED';

@Component({
  selector: 'app-facility-service-config',
  templateUrl: './facility-service-config.component.html',
  styleUrls: ['./facility-service-config.component.scss'],
})
export class FacilityServiceConfigComponent implements OnInit {
  serviceField = new FormControl();
  resourceField = new FormControl();
  groupField = new FormControl();
  memberField = new FormControl();

  filteredServices: Observable<Service[] | ServiceSelectValue[]>;
  filteredResources: Observable<Resource[]>;
  filteredGroups: Observable<Group[]>;
  filteredMembers: Observable<RichMember[]>;

  serviceAllTranslation: string;
  serviceNotSelectedTranslation: string;
  allowedStatuses: string[] = ['INVALID', 'VALID'];

  facility: Facility;
  serviceId: number;

  services: Service[];
  resources: Resource[];
  groups: Group[];
  vos: Vo[];
  members: RichMember[];

  selectedService: Service | ServiceSelectValue = 'NOT_SELECTED';
  selectedResource: Resource;
  selectedGroup: Group;
  selectedVo: Vo;
  selectedMember: RichMember;

  private attrNames = [];

  constructor(
    private facilityManager: FacilitiesManagerService,
    private resourceManager: ResourcesManagerService,
    private serviceManager: ServicesManagerService,
    private membersManager: MembersManagerService,
    private namePipe: UserFullNamePipe,
    private translate: TranslateService,
    private entityStorageService: EntityStorageService
  ) {
    this.translate
      .get('FACILITY_DETAIL.SERVICE_CONFIG.ALL')
      .subscribe((value: string) => (this.serviceAllTranslation = value));
    this.translate
      .get('FACILITY_DETAIL.SERVICE_CONFIG.NOT_SELECTED')
      .subscribe((value: string) => (this.serviceNotSelectedTranslation = value));
  }

  ngOnInit(): void {
    this.facility = this.entityStorageService.getEntity();
    this.facilityManager.getFacilityById(this.facility.id).subscribe((facility) => {
      this.facility = facility;

      this.facilityManager
        .getAssignedResourcesForFacility(facility.id)
        .subscribe((resources) => (this.resources = resources));

      this.serviceManager
        .getAssignedServices(facility.id)
        .subscribe((services) => (this.services = services));
    });
    this.filteredServices = this.serviceField.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filterServices(value))
    );
    this.filteredResources = this.resourceField.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filterResources(value))
    );
    this.filteredGroups = this.groupField.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filterGroups(value))
    );
    this.filteredMembers = this.memberField.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filterMembers(value))
    );
  }

  onSelectedService(s: Service | ServiceSelectValue): void {
    this.selectedService = s;
  }

  onSelectedResource(r: Resource): void {
    this.selectedResource = r;
    if (this.selectedResource !== undefined) {
      this.resourceManager
        .getAssignedGroups(this.selectedResource.id)
        .subscribe((groups) => (this.groups = groups));
      this.selectedGroup = undefined;
      this.selectedMember = undefined;
    } else {
      this.groups = undefined;
    }
  }

  onOfferAllServices(event: MatCheckboxChange): void {
    if (!event.checked) {
      this.serviceManager
        .getAssignedServices(this.facility.id)
        .subscribe((services) => (this.services = services));
    }
  }

  onSelectedGroup(g: Group): void {
    this.selectedGroup = g;
    if (this.selectedGroup !== undefined) {
      this.membersManager
        .getCompleteRichMembersForGroup(
          this.selectedGroup.id,
          false,
          this.allowedStatuses,
          [],
          this.attrNames as string[]
        )
        .subscribe((members) => (this.members = members));
      this.selectedMember = undefined;
    } else {
      this.members = undefined;
    }
  }

  onSelectedMember(m: RichMember): void {
    this.selectedMember = m;
  }

  serviceDisplayFn(service: Service | ServiceSelectValue): string {
    if (service !== null) {
      if (service === 'ALL') {
        return this.serviceAllTranslation;
      }
      if (service === 'NOT_SELECTED') {
        return this.serviceNotSelectedTranslation;
      }
      return typeof service !== 'string' ? service.name : service;
    }
  }

  resourceDisplayFn(resource: Resource): string {
    if (resource !== null) {
      return resource.name;
    }
  }

  groupDisplayFn(group: Group): string {
    if (group !== null) {
      return group.name;
    }
  }

  memberDisplayFn(member: RichMember): string {
    if (member !== null) {
      return this.namePipe.transform(member.user);
    }
  }

  updatedSerVal(e: KeyboardEvent): void {
    if ((e.target as HTMLInputElement).value === '') {
      this.selectedService = 'NOT_SELECTED';
    }
  }

  updatedResVal(e: KeyboardEvent): void {
    if ((e.target as HTMLInputElement).value === '') {
      this.groups = undefined;
      this.members = undefined;
    }
  }

  updatedGroupVal(e: KeyboardEvent): void {
    if ((e.target as HTMLInputElement).value === '') {
      this.members = undefined;
    }
  }

  private _filterServices(value: string): Service[] | ServiceSelectValue[] {
    const filterValue = value.toString().toLowerCase();

    return this.services.filter((service) =>
      service.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(filterValue)
    );
  }

  private _filterResources(value: string): Resource[] {
    const filterValue = value.toString().toLowerCase();

    return this.resources.filter((resource) =>
      resource.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(filterValue)
    );
  }

  private _filterGroups(value: string): Group[] {
    const filterValue = value.toString().toLowerCase();

    return this.groups.filter((group) =>
      group.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(filterValue)
    );
  }

  private _filterMembers(value: string): RichMember[] {
    const filterValue = value.toString().toLowerCase();
    return this.members.filter((member) =>
      this.namePipe
        .transform(member.user)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(filterValue)
    );
  }
}
