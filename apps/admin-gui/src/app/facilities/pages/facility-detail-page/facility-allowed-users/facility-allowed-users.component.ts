import { Component, OnInit } from '@angular/core';
import { TABLE_FACILITY_ALLOWED_USERS } from '@perun-web-apps/config/table-config';
import {
  ConsentStatus,
  ConsentsManagerService,
  FacilitiesManagerService,
  Facility,
  Resource,
  ResourcesManagerService,
  Service,
  ServicesManagerService,
  User,
  Vo,
} from '@perun-web-apps/perun/openapi';
import {
  EntityStorageService,
  GuiAuthResolver,
  StoreService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-facility-allowed-users',
  templateUrl: './facility-allowed-users.component.html',
  styleUrls: ['./facility-allowed-users.component.scss'],
})
export class FacilityAllowedUsersComponent implements OnInit {
  static id = 'FacilityAllowedUsersComponent';

  loading = false;
  filterValue = '';

  facility: Facility;
  users: User[];
  attributes: string[] = [];

  allowed = true;

  resources: Resource[] = [];
  filteredResources: Resource[] = [];
  selectedResource: Resource;
  vos: Vo[] = [];
  selectedVo: Vo;
  services: Service[] = [];
  filteredServices: Service[] = [];
  selectedService: Service;

  globalForceConsents: boolean;
  facilityForceConsents: boolean;
  consentStatusesList = ['UNSIGNED', 'GRANTED', 'REVOKED'];
  selectedConsentStatuses: ConsentStatus[] = [];
  statuses: FormControl<ConsentStatus[]>;

  resourceAssignedServices: Map<number, number[]> = new Map<number, number[]>();

  tableId = TABLE_FACILITY_ALLOWED_USERS;

  routeAuth: boolean;
  toggle_messages: string[] = [
    'FACILITY_DETAIL.ALLOWED_USERS.FILTER_ASSIGNED_MSG',
    'FACILITY_DETAIL.ALLOWED_USERS.FILTER_ALLOWED_MSG',
  ];

  advancedFilter = false;
  filtersCount: number;

  constructor(
    private facilityService: FacilitiesManagerService,
    private serviceService: ServicesManagerService,
    private resourceService: ResourcesManagerService,
    private authResolver: GuiAuthResolver,
    private storeService: StoreService,
    private entityStorageService: EntityStorageService,
    private consentService: ConsentsManagerService,
    private translate: PerunTranslateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.statuses = new FormControl<ConsentStatus[]>(this.selectedConsentStatuses);
    this.attributes = [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL];
    this.attributes = this.attributes.concat(this.storeService.getLoginAttributeNames());
    this.facility = this.entityStorageService.getEntity();
    this.globalForceConsents = this.storeService.getProperty('enforce_consents');
    this.consentService.getConsentHubByFacility(this.facility.id).subscribe((hub) => {
      this.facilityForceConsents = hub.enforceConsents;
    });
    this.routeAuth = this.authResolver.isPerunAdminOrObserver();
    this.changeFilter();
    this.refreshPage();
  }

  changeFilter(): void {
    this.filtersCount = this.allowed ? 1 : 0;
    if (this.selectedVo) {
      this.filtersCount += 1;
    }
    if (this.selectedResource) {
      this.filtersCount += 1;
    }
    if (this.selectedService) {
      this.filtersCount += 1;
    }
    if (this.selectedConsentStatuses.length > 0) {
      this.filtersCount += 1;
    }
  }

  clearFilters(): void {
    this.allowed = false;
    this.selectedVo = undefined;
    this.selectedResource = undefined;
    this.selectedService = undefined;
    this.selectedConsentStatuses = [];
    this.statuses.setValue(this.selectedConsentStatuses);
    this.filtersCount = 0;
    this.voSelected(this.selectedVo);
    this.resourceSelected(this.selectedResource);
    this.serviceSelected(this.selectedService);
  }

  refreshPage(): void {
    this.loading = true;

    this.facilityService.getAssignedResourcesForFacility(this.facility.id).subscribe(
      (resources) => {
        this.resources = resources;
        this.filteredResources = this.resources;

        this.facilityService.getAllowedVos(this.facility.id).subscribe(
          (vos) => {
            this.vos = vos;
            this.serviceService.getAssignedServices(this.facility.id).subscribe(
              (services) => {
                this.services = services;
                this.filteredServices = this.services;
                this.loading = false;
              },
              () => (this.loading = false)
            );
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  voSelected(vo: Vo): void {
    this.selectedVo = vo;
    this.selectedResource = undefined;
    this.selectedService = undefined;

    if (!vo) {
      this.filteredResources = this.resources;
      this.filteredServices = this.services;
    } else {
      this.filteredResources = this.resources.filter((res) => res.voId === vo.id);
      this.serviceService.getAssignedServicesVo(this.facility.id, vo.id).subscribe(
        (services) => {
          this.filteredServices = services;
          this.loading = false;
        },
        () => (this.loading = false)
      );
    }
    this.changeFilter();
  }

  resourceSelected(resource: Resource): void {
    this.selectedResource = resource;
    this.selectedService = undefined;

    if (resource === undefined) {
      this.filteredServices = this.services;
    } else {
      this.resourceService.getAssignedServicesToResource(resource.id).subscribe(
        (services) => {
          this.filteredServices = services;
          this.loading = false;
        },
        () => (this.loading = false)
      );
    }
    this.changeFilter();
  }

  serviceSelected(service: Service): void {
    this.selectedService = service;
    this.changeFilter();
  }

  consentStatusSelected(): void {
    this.selectedConsentStatuses = this.statuses.value;
    this.changeFilter();
  }

  displaySelectedStatuses(): string {
    if (this.selectedConsentStatuses.length === this.consentStatusesList.length) {
      return 'ALL';
    }
    const statuses: string[] = this.statuses.value;
    if (statuses) {
      const translatedStatus = this.translate.instant('CONSENTS.STATUS_' + statuses[0]);
      return `${translatedStatus}  ${
        statuses.length > 1
          ? '(+' +
            (statuses.length - 1).toString() +
            ' ' +
            (statuses.length === 2 ? 'other)' : 'others)')
          : ''
      }`;
    }
    return '';
  }
}
