import { Component, OnInit } from '@angular/core';
import { RichDestination, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  TABLE_FACILITY_SERVICES_DESTINATION_LIST,
} from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemoveDestinationDialogComponent } from '../../../../../../shared/components/dialogs/remove-destination-dialog/remove-destination-dialog.component';

@Component({
  selector: 'app-service-destinations',
  templateUrl: './service-destinations.component.html',
  styleUrls: ['./service-destinations.component.scss']
})
export class ServiceDestinationsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private serviceManager: ServicesManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private dialog: MatDialog,
              public authResolver: GuiAuthResolver
              ) { }

  loading = false;
  filterValue = '';

  serviceId: number;
  destinations: RichDestination[] = [];
  selection = new SelectionModel<RichDestination>(true, []);

  tableId = TABLE_FACILITY_SERVICES_DESTINATION_LIST;

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe(params => {
      this.serviceId = params['serviceId'];
      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.serviceManager.getAllRichDestinationsForService(this.serviceId).subscribe(destinations => {
      this.selection.clear();
      this.filterValue = "";
      this.destinations = destinations;
      this.loading = false;
    });
  }

  blockServiceOnDestinations(destinations: RichDestination[]){
    if (destinations.length === 0){
      this.notificator.showSuccess(this.translate.instant('SERVICE_DETAIL.DESTINATIONS.BLOCK_SUCCESS'));
      this.refreshTable();
      return;
    }

    const destination = destinations.pop();
    this.serviceManager.blockServiceOnDestination(this.serviceId, destination.id).subscribe(() => {
      this.blockServiceOnDestinations(destinations);
    }, () => this.loading = false);
  }

  onBlock() {
    this.loading = true;
    this.blockServiceOnDestinations(this.selection.selected);
  }

  allowServiceOnDestinations(destinations: RichDestination[]) {
    if (destinations.length === 0){
      this.notificator.showSuccess(this.translate.instant('SERVICE_DETAIL.DESTINATIONS.ALLOW_SUCCESS'));
      this.refreshTable();
      return;
    }

    const destination = destinations.pop();
    this.serviceManager.unblockServiceOnDestinationById(this.serviceId, destination.id).subscribe(() => {
      this.allowServiceOnDestinations(destinations);
    }, () => this.loading = false);
  }

  onAllow() {
    this.loading = true;
    this.allowServiceOnDestinations(this.selection.selected);
  }

  onRemove() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      destinations: this.selection.selected,
      theme: 'admin-theme'
    };

    const dialogRef = this.dialog.open(RemoveDestinationDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

}
