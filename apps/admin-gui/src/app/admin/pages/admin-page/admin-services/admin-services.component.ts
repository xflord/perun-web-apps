import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Service, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_ADMIN_SERVICES } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditServiceDialogComponent } from '../../../../shared/components/dialogs/create-edit-service-dialog/create-edit-service-dialog.component';
import { DeleteServiceDialogComponent } from '../../../../shared/components/dialogs/delete-service-dialog/delete-service-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-admin-services',
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.scss'],
})
export class AdminServicesComponent implements OnInit {
  static id = 'AdminServicesComponent';

  services: Service[];
  selection = new SelectionModel<Service>(true, []);
  loading = false;
  filterValue = '';
  tableId = TABLE_ADMIN_SERVICES;

  constructor(
    private serviceManager: ServicesManagerService,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.serviceManager.getServices().subscribe((services) => {
      this.services = services;
      this.refreshTable();
    });
  }

  createService(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      theme: 'admin-theme',
    };

    const dialogRef = this.dialog.open(CreateEditServiceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  deleteService(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      theme: 'admin-theme',
      services: this.selection.selected,
    };

    const dialogRef = this.dialog.open(DeleteServiceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.serviceManager.getServices().subscribe((services) => {
      this.services = services;
      this.selection.clear();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
