import { AfterViewChecked, Component, HostBinding, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { EnrichedFacility, FacilitiesManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';
import { TABLE_FACILITY_SELECT } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { CreateFacilityDialogComponent } from '../../../shared/components/dialogs/create-facility-dialog/create-facility-dialog.component';
import { DeleteFacilityDialogComponent } from '../../../shared/components/dialogs/delete-facility-dialog/delete-facility-dialog.component';

@Component({
  selector: 'app-facility-select-page',
  templateUrl: './facility-select-page.component.html',
  styleUrls: ['./facility-select-page.component.scss'],
})
export class FacilitySelectPageComponent implements OnInit, AfterViewChecked {
  static id = 'FacilitySelectPageComponent';

  @HostBinding('class.router-component') true;

  facilities: EnrichedFacility[] = [];
  recentIds: number[] = [];
  loading: boolean;
  filterValue = '';
  tableId = TABLE_FACILITY_SELECT;
  selection = new SelectionModel<EnrichedFacility>(false, []);
  includeDestinations: boolean;

  constructor(
    private facilityManager: FacilitiesManagerService,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.refreshTable();
  }

  ngAfterViewChecked(): void {
    this.sideMenuService.setFacilityMenuItems([]);
  }

  refreshTable(): void {
    this.loading = true;
    this.facilityManager.getEnrichedFacilities().subscribe((facilities) => {
      this.selection.clear();
      this.facilities = facilities;
      this.recentIds = getRecentlyVisitedIds('facilities');
      this.loading = false;
    });
  }

  onCreate(): void {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = {
      theme: 'facility-theme',
    };

    const dialogRef = this.dialog.open(CreateFacilityDialogComponent, config);

    dialogRef.afterClosed().subscribe((facilityCreated) => {
      if (facilityCreated) {
        this.loading = true;
        this.refreshTable();
      }
    });
  }

  onDelete(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'facility-theme',
      facility: this.selection.selected[0].facility,
    };
    const dialogRef = this.dialog.open(DeleteFacilityDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
