import { Component, ChangeDetectorRef, HostBinding, OnInit, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { RemoveResourceDialogComponent } from '../../../../shared/components/dialogs/remove-resource-dialog/remove-resource-dialog.component';
import {
  FacilitiesManagerService,
  ServicesManagerService,
  Facility,
  RichResource,
  Service,
} from '@perun-web-apps/perun/openapi';
import { CreateResourceDialogComponent } from '../../../../shared/components/dialogs/create-resource-dialog/create-resource-dialog.component';
import { TABLE_FACILITY_RESOURCES_LIST } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-resources',
  templateUrl: './facility-resources.component.html',
  styleUrls: ['./facility-resources.component.scss'],
})
export class FacilityResourcesComponent implements OnInit, AfterViewInit {
  static id = 'FacilityResourcesComponent';

  // class used for animation
  @HostBinding('class.router-component') true;

  facility: Facility;
  resources: RichResource[] = [];
  selected = new SelectionModel<RichResource>(true, []);

  emptyService: Service = { id: -1, beanName: 'Service', name: 'All' };
  services: Service[] = [this.emptyService];
  selectedService: Service = this.emptyService;

  filterValue = '';

  loading: boolean;
  tableId = TABLE_FACILITY_RESOURCES_LIST;
  displayedColumns = ['id', 'vo', 'facility', 'description'];

  addAuth: boolean;
  removeAuth: boolean;
  routeAuth: boolean;

  constructor(
    private dialog: MatDialog,
    private facilitiesManager: FacilitiesManagerService,
    private servicesManager: ServicesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.facility = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.servicesManager.getAssignedServices(this.facility.id).subscribe((services) => {
      this.services = [this.emptyService].concat(services);
    });
    this.loadResourcesForFacility();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  removeResource(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { theme: 'facility-theme', resources: this.selected.selected };

    const dialogRef = this.dialog.open(RemoveResourceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  refreshTable(): void {
    this.loading = true;
    if (this.selectedService.id === -1) {
      this.loadResourcesForFacility();
    } else {
      this.facilitiesManager
        .getAssignedRichResourcesForFacilityAndService(this.facility.id, this.selectedService.id)
        .subscribe((resources) => {
          this.resources = resources;
          this.selected.clear();
          this.setAuthRights();
          this.loading = false;
        });
    }
  }

  setAuthRights(): void {
    this.addAuth = this.authResolver.isAuthorized('createResource_Resource_Vo_Facility_policy', [
      this.facility,
    ]);

    this.removeAuth = this.authResolver.isAuthorized('deleteResource_Resource_policy', [
      this.facility,
    ]);
    this.displayedColumns = this.removeAuth
      ? ['select', 'id', 'name', 'vo', 'description']
      : ['id', 'name', 'vo', 'description'];

    if (this.resources.length !== 0) {
      this.routeAuth = this.authResolver.isAuthorized('getRichResourceById_int_policy', [
        this.facility,
        this.resources[0],
      ]);
    }
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  createResource(): void {
    const config = getDefaultDialogConfig();
    config.width = '1350px';
    config.data = { facilityId: this.facility.id, theme: 'facility-theme' };

    const dialogRef = this.dialog.open(CreateResourceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  serviceSelected(service: Service): void {
    this.selectedService = service;
    this.refreshTable();
  }

  private loadResourcesForFacility(): void {
    this.facilitiesManager
      .getAssignedRichResourcesForFacility(this.facility.id)
      .subscribe((resources) => {
        this.resources = resources;
        this.selected.clear();
        this.setAuthRights();
        this.loading = false;
      });
  }
}
