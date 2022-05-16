import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  FacilitiesManagerService,
  Facility,
  RichDestination,
  Service,
  ServicesManagerService,
} from '@perun-web-apps/perun/openapi';
import { TABLE_FACILITY_SERVICES_DESTINATION_LIST } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { RemoveDestinationDialogComponent } from '../../../../shared/components/dialogs/remove-destination-dialog/remove-destination-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { AddServicesDestinationDialogComponent } from '../../../../shared/components/dialogs/add-services-destination-dialog/add-services-destination-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-perun-web-apps-facility-services-destinations',
  templateUrl: './facility-services-destinations.component.html',
  styleUrls: ['./facility-services-destinations.component.scss'],
})
export class FacilityServicesDestinationsComponent implements OnInit {
  static id = 'FacilityServicesDestinationsComponent';

  // class used for animation
  @HostBinding('class.router-component') true;

  @Input()
  displayedColumns: string[] = [
    'select',
    'destinationId',
    'service',
    'destination',
    'type',
    'status',
    'propagationType',
  ];
  @Input()
  configServices: Service[] = [];
  @Input()
  configServicesIds: Set<number> = new Set<number>();
  @Input()
  title = 'FACILITY_DETAIL.SERVICES_DESTINATIONS.TITLE';
  @Output()
  destinationEmitter: EventEmitter<RichDestination[]> = new EventEmitter<RichDestination[]>();
  @Input()
  loading: boolean;

  facility: Facility;
  destinations: RichDestination[];
  selected = new SelectionModel<RichDestination>(true, []);
  filterValue = '';
  tableId = TABLE_FACILITY_SERVICES_DESTINATION_LIST;

  addAuth: boolean;
  removeAuth: boolean;
  allowAuth: boolean;
  blockAuth: boolean;

  constructor(
    private dialog: MatDialog,
    private facilitiesManager: FacilitiesManagerService,
    private servicesManager: ServicesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private authResolver: GuiAuthResolver,
    private serviceManager: ServicesManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.facility = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.servicesManager
      .getAllRichDestinationsForFacility(this.facility.id)
      .subscribe((destinations) => {
        this.destinations = destinations;
        this.destinationEmitter.emit(this.destinations);
        this.selected.clear();
        this.setAuthRights();
        this.loading = false;
      });
  }

  setAuthRights(): void {
    this.addAuth = this.authResolver.isAuthorized(
      'addDestination_Service_Facility_Destination_policy',
      [this.facility]
    );
    this.removeAuth = this.authResolver.isAuthorized(
      'removeDestination_Service_Facility_Destination_policy',
      [this.facility]
    );
    this.allowAuth = this.authResolver.isAuthorized(
      'unblockServiceOnDestination_Service_int_policy',
      [this.facility]
    );
    this.blockAuth = this.authResolver.isAuthorized(
      'blockServiceOnDestination_Service_int_policy',
      [this.facility]
    );

    this.displayedColumns = this.removeAuth
      ? this.displayedColumns
      : this.displayedColumns.filter((col) => col !== 'select');
  }

  addDestination(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      facility: this.facility,
      theme: 'facility-theme',
      configServices: this.configServices,
    };

    const dialogRef = this.dialog.open(AddServicesDestinationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.translate
          .get('FACILITY_DETAIL.SERVICES_DESTINATIONS.ADD_SUCCESS')
          .subscribe((successMessage: string) => {
            this.refreshTable();
            this.notificator.showSuccess(successMessage);
          });
      }
    });
  }

  removeDestination(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = { destinations: this.selected.selected, theme: 'facility-theme' };

    const dialogRef = this.dialog.open(RemoveDestinationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  blockServiceOnDestinations(destinations: RichDestination[]): void {
    if (destinations.length === 0) {
      this.notificator.showSuccess(
        this.translate.instant('FACILITY_DETAIL.SERVICES_DESTINATIONS.BLOCK_SUCCESS') as string
      );
      this.refreshTable();
      return;
    }

    const destination = destinations.pop();
    this.serviceManager.blockServiceOnDestination(destination.service.id, destination.id).subscribe(
      () => {
        this.blockServiceOnDestinations(destinations);
      },
      () => (this.loading = false)
    );
  }

  onBlock(): void {
    this.loading = true;
    this.blockServiceOnDestinations(this.selected.selected);
  }

  allowServiceOnDestinations(destinations: RichDestination[]): void {
    if (destinations.length === 0) {
      this.notificator.showSuccess(
        this.translate.instant('FACILITY_DETAIL.SERVICES_DESTINATIONS.ALLOW_SUCCESS') as string
      );
      this.refreshTable();
      return;
    }

    const destination = destinations.pop();
    this.serviceManager
      .unblockServiceOnDestinationById(destination.service.id, destination.id)
      .subscribe(
        () => {
          this.allowServiceOnDestinations(destinations);
        },
        () => (this.loading = false)
      );
  }

  onAllow(): void {
    this.loading = true;
    this.allowServiceOnDestinations(this.selected.selected);
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  allSelectedAllowed(): boolean {
    return this.selected.selected.reduce((acc, destination) => acc && !destination.blocked, true);
  }

  allSelectedBlocked(): boolean {
    return this.selected.selected.reduce((acc, destination) => acc && destination.blocked, true);
  }
}
