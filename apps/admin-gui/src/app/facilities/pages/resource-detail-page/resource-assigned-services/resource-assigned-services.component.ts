import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resource, ResourcesManagerService, Service } from '@perun-web-apps/perun/openapi';
import { TABLE_RESOURCE_ASSIGNED_SERVICES } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AssignServiceToResourceDialogComponent } from '../../../../shared/components/dialogs/assign-service-to-resource-dialog/assign-service-to-resource-dialog.component';
import { RemoveServiceFromResourceDialogComponent } from '../../../../shared/components/dialogs/remove-service-from-resource-dialog/remove-service-from-resource-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-resource-assigned-services',
  templateUrl: './resource-assigned-services.component.html',
  styleUrls: ['./resource-assigned-services.component.scss'],
})
export class ResourceAssignedServicesComponent implements OnInit {
  resource: Resource;
  assignedServices: Service[] = [];
  selected = new SelectionModel<Service>(true, []);
  loading: boolean;
  tableId = TABLE_RESOURCE_ASSIGNED_SERVICES;
  filterValue = '';
  assignServiceAuth: boolean;
  removeServiceAuth: boolean;
  serviceRoutingAuth: boolean;
  displayedColumns = ['select', 'id', 'name', 'enabled', 'script', 'description'];

  constructor(
    private route: ActivatedRoute,
    private resourcesManager: ResourcesManagerService,
    private dialog: MatDialog,
    public guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resource = this.entityStorageService.getEntity();
    this.getDataForAuthorization();
    this.loadAllServices();
  }

  loadAllServices(): void {
    this.loading = true;
    this.resourcesManager
      .getAssignedServicesToResource(this.resource.id)
      .subscribe((assignedServices) => {
        this.assignedServices = assignedServices;
        this.selected.clear();
        this.loading = false;
      });
  }

  addService(): void {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = { theme: 'resource-theme', resourceId: this.resource.id };

    const dialogRef = this.dialog.open(AssignServiceToResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllServices();
      }
    });
  }

  removeServices(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'resource-theme',
      resourceId: this.resource.id,
      services: this.selected.selected,
    };

    const dialogRef = this.dialog.open(RemoveServiceFromResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllServices();
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  getDataForAuthorization(): void {
    this.assignServiceAuth = this.guiAuthResolver.isAuthorized(
      'assignServices_Resource_List<Service>_policy',
      [this.resource]
    );
    this.removeServiceAuth = this.guiAuthResolver.isAuthorized(
      'removeServices_Resource_List<Service>_policy',
      [this.resource]
    );
    this.displayedColumns = this.removeServiceAuth
      ? ['select', 'id', 'name', 'enabled', 'script', 'description']
      : ['id', 'name', 'enabled', 'script', 'description'];
    this.serviceRoutingAuth = this.guiAuthResolver.isPerunAdminOrObserver();
  }
}
