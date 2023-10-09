import { Component, OnInit } from '@angular/core';
import { RichDestination, Service, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_FACILITY_SERVICES_DESTINATION_LIST } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  RemoveDestinationDialogComponent,
  RemoveDestinationDialogData,
} from '../../../../../../shared/components/dialogs/remove-destination-dialog/remove-destination-dialog.component';

@Component({
  selector: 'app-service-destinations',
  templateUrl: './service-destinations.component.html',
  styleUrls: ['./service-destinations.component.scss'],
})
export class ServiceDestinationsComponent implements OnInit {
  loading = false;
  filterValue = '';
  destinations: RichDestination[] = [];
  selection = new SelectionModel<RichDestination>(true, []);
  tableId = TABLE_FACILITY_SERVICES_DESTINATION_LIST;
  private service: Service;

  constructor(
    private serviceManager: ServicesManagerService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service = this.entityStorageService.getEntity();
    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.serviceManager
      .getAllRichDestinationsForService(this.service.id)
      .subscribe((destinations) => {
        this.selection.clear();
        this.filterValue = '';
        this.destinations = destinations;
        this.loading = false;
      });
  }

  onBlock(): void {
    this.loading = true;
    this.blockServiceOnDestinations(this.selection.selected);
  }

  onAllow(): void {
    this.loading = true;
    this.allowServiceOnDestinations(this.selection.selected);
  }

  onRemove(): void {
    const config = getDefaultDialogConfig<RemoveDestinationDialogData>();
    config.width = '500px';
    config.data = {
      destinations: this.selection.selected,
      theme: 'admin-theme',
    };

    const dialogRef = this.dialog.open(RemoveDestinationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  private blockServiceOnDestinations(destinations: RichDestination[]): void {
    this.serviceManager.blockServicesOnDestinations({ richDestinations: destinations }).subscribe({
      next: () => {
        this.notificator.showSuccess(
          this.translate.instant('SERVICE_DETAIL.DESTINATIONS.BLOCK_SUCCESS')
        );
        this.refreshTable();
      },
      error: () => (this.loading = false),
    });
  }

  private allowServiceOnDestinations(destinations: RichDestination[]): void {
    this.serviceManager
      .unblockServicesOnDestinations({ richDestinations: destinations })
      .subscribe({
        next: () => {
          this.notificator.showSuccess(
            this.translate.instant('SERVICE_DETAIL.DESTINATIONS.ALLOW_SUCCESS')
          );
          this.refreshTable();
        },
        error: () => (this.loading = false),
      });
  }
}
