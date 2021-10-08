import { Component, OnInit } from '@angular/core';
import { TABLE_FACILITY_ALLOWED_USERS } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import {
  FacilitiesManagerService,
  Facility,
  Resource, ResourcesManagerService,
  Service, ServicesManagerService,
  User,
  Vo
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';

@Component({
  selector: 'app-facility-allowed-users',
  templateUrl: './facility-allowed-users.component.html',
  styleUrls: ['./facility-allowed-users.component.scss']
})
export class FacilityAllowedUsersComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private facilityService: FacilitiesManagerService,
    private serviceService: ServicesManagerService,
    private resourceService: ResourcesManagerService,
    private authResolver: GuiAuthResolver,
    private storeService: StoreService) { }

  loading = false;
  filterValue = '';

  facilityId: number;
  facility: Facility;
  users: User[];
  attributes: string[] = []

  allowed = true;

  emptyResource: Resource = {id: -1, beanName: 'Resource', name: "No filter"};
  resources: Resource[] = [this.emptyResource];
  filteredResources: Resource[] = [this.emptyResource];
  selectedResource: Resource = this.emptyResource;

  emptyVo: Vo = {id: -1, beanName: 'Vo', name: "No filter"};
  vos: Vo[] = [this.emptyVo];
  selectedVo: Vo = this.emptyVo;

  emptyService: Service = {id: -1, beanName: 'Service', name: "No filter"};
  services: Service[] = [this.emptyService];
  filteredServices: Service[] = [this.emptyService];
  selectedService: Service  = this.emptyService;

  resourceAssignedServices: Map<number, number[]> = new Map<number, number[]>();

  tableId = TABLE_FACILITY_ALLOWED_USERS;

  routeAuth: boolean;
  toggle_messages: string[] = ['FACILITY_DETAIL.ALLOWED_USERS.FILTER_ASSIGNED_MSG',
    'FACILITY_DETAIL.ALLOWED_USERS.FILTER_ALLOWED_MSG'];

  ngOnInit(): void {
    this.loading = true;
    this.attributes = [
      Urns.USER_DEF_ORGANIZATION,
      Urns.USER_DEF_PREFERRED_MAIL
    ];
    this.attributes = this.attributes.concat(this.storeService.getLoginAttributeNames());

    this.route.parent.params.subscribe(params => {
      this.facilityId = params['facilityId'];
      this.routeAuth = this.authResolver.isPerunAdminOrObserver();
      this.refreshPage();
    }, () => this.loading = false);
  }

  refreshPage() {
    this.loading = true;

    this.facilityService.getAssignedResourcesForFacility(this.facilityId)
      .subscribe(resources => {
        this.resources = [this.emptyResource].concat(resources);
        this.filteredResources = this.resources;
        this.selectedResource = this.emptyResource;

        this.facilityService.getAllowedVos(this.facilityId)
          .subscribe(vos => {
            this.vos = [this.emptyVo].concat(vos);
            this.selectedVo = this.emptyVo;

            this.services = [];
            this.getAssignedServices(this.resources, this.resources.length - 1);
          }, () => this.loading = false);
      }, () => this.loading = false);
  }

  getAssignedServices(resources: Resource[], idx: number) {
    // resource at index 0 is just placeholder
    if (idx === 0) {
      this.services = [this.emptyService].concat(this.services);
      this.filteredServices = this.services;
      this.selectedService = this.emptyService;
      this.loading = false;
      return;
    }

    this.resourceService.getAssignedServicesToResource(resources[idx].id)
      .subscribe(services => {
        this.services = this.services.concat(services);
        this.resourceAssignedServices[resources[idx].id] = services.map(service => service.id);
        this.getAssignedServices(resources, idx - 1);
      }, () => this.loading = false);
  }

  getFilteredServices(resources: Resource[]): Service[] {
    const serviceIds: Set<number> = new Set<number>();
    resources.forEach(res => {
      this.resourceAssignedServices[res.id].forEach(serviceId => serviceIds.add(serviceId));
    });

    return [this.emptyService].concat(this.services.filter(service => serviceIds.has(service.id)));
  }


  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  voSelected(vo: Vo) {
    // prevents "fake" triggers
    if(this.selectedVo.id === vo.id) {
      return;
    }

    this.selectedVo = vo;
    this.selectedResource = this.emptyResource;
    this.selectedService = this.emptyService;

    if(vo.id === -1){
      this.filteredResources = this.resources;
      this.filteredServices = this.services;
    } else {
      this.filteredResources = this.resources.filter(res => res.voId === vo.id);
      this.filteredServices = this.getFilteredServices(this.filteredResources);
      this.filteredResources = [this.emptyResource].concat(this.filteredResources);
    }
  }

  resourceSelected(resource: Resource) {
    // prevents "fake" triggers
    if(this.selectedResource.id === resource.id) {
      return;
    }

    this.selectedResource = resource;
    this.selectedService = this.emptyService;

    if (resource.id === -1) {
      this.filteredServices = this.services;
    } else {
      this.filteredServices = this.getFilteredServices([resource]);
    }
  }

  serviceSelected(service: Service) {
    this.selectedService = service;
  }
}
