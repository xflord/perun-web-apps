import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  ResourcesManagerService,
  Service,
  ServicesManagerService,
  ServicesPackage,
} from '@perun-web-apps/perun/openapi';
import { TABLE_ASSIGN_SERVICE_TO_RESOURCE_DIALOG } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';

export interface AssignServiceToResourceDialogData {
  theme: string;
  resourceId: number;
}

@Component({
  selector: 'app-perun-web-apps-assign-service-to-resource-dialog',
  templateUrl: './assign-service-to-resource-dialog.component.html',
  styleUrls: ['./assign-service-to-resource-dialog.component.scss'],
})
export class AssignServiceToResourceDialogComponent implements OnInit {
  loading = false;
  theme: string;
  unAssignedServices: Service[] = [];
  filteredServices: Service[] = [];
  servicePackages: ServicesPackage[] = [];
  selectedPackage: ServicesPackage = {
    name: 'Not selected',
    description: '',
    id: -1,
    beanName: 'ServicePackage',
  };
  selection = new SelectionModel<Service>(true, []);
  tableId = TABLE_ASSIGN_SERVICE_TO_RESOURCE_DIALOG;
  filterValue = '';

  constructor(
    private dialogRef: MatDialogRef<AssignServiceToResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignServiceToResourceDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private resourceManager: ResourcesManagerService,
    private servicesManager: ServicesManagerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.resourceManager
      .getAssignedServicesToResource(this.data.resourceId)
      .subscribe((assignedServices) => {
        this.servicesManager.getServices().subscribe((allServices) => {
          this.servicesManager.getServicesPackages().subscribe((packages) => {
            this.servicePackages.push(this.selectedPackage);
            this.servicePackages = this.servicePackages.concat(packages);
            this.unAssignedServices = allServices;
            for (const assignedService of assignedServices) {
              for (const allService of allServices) {
                if (assignedService.id === allService.id) {
                  this.unAssignedServices.splice(this.unAssignedServices.indexOf(allService), 1);
                }
              }
            }
            this.loading = false;
          });
        });
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    this.loading = true;
    if (this.selectedPackage.id !== -1) {
      this.addServicePackage();
    } else {
      this.addServices();
    }
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  servicePackageSelected(servicesPackage: ServicesPackage): void {
    this.selectedPackage = servicesPackage;
    if (servicesPackage.id !== -1) {
      this.servicesManager
        .getServicesFromServicesPackage(servicesPackage.id)
        .subscribe((services) => {
          this.filteredServices = services;
        });
    } else {
      this.filteredServices = [];
    }
  }

  tabChanged(): void {
    this.selection.clear();
    this.filterValue = '';
    this.selectedPackage = this.servicePackages[0];
  }

  private addServicePackage(): void {
    this.resourceManager
      .assignServicesPackage(this.data.resourceId, this.selectedPackage.id)
      .subscribe(
        () => {
          this.translate
            .get('DIALOGS.ASSIGN_SERVICE_TO_RESOURCE.PACKAGE_SUCCESS_MESSAGE')
            .subscribe((message: string) => {
              this.notificator.showSuccess(message);
              if (this.selection.selected.length !== 0) {
                this.addServices();
              } else {
                this.dialogRef.close(true);
              }
            });
        },
        () => (this.loading = false)
      );
  }

  private addServices(): void {
    const addedServices: number[] = [];
    for (const service of this.selection.selected) {
      addedServices.push(service.id);
    }
    this.resourceManager.assignServices(this.data.resourceId, addedServices).subscribe(
      () => {
        this.translate
          .get('DIALOGS.ASSIGN_SERVICE_TO_RESOURCE.SERVICE_SUCCESS_MESSAGE')
          .subscribe((message: string) => {
            this.notificator.showSuccess(message);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }
}
