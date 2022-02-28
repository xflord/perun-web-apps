import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FacilitiesManagerService, Facility, Owner } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { AddFacilityOwnerDialogComponent } from '../../../../../shared/components/dialogs/add-facility-owner-dialog/add-facility-owner-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemoveFacilityOwnerDialogComponent } from '../../../../../shared/components/dialogs/remove-facility-owner-dialog/remove-facility-owner-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { TABLE_FACILITY_OWNERS } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-facility-settings-owners',
  templateUrl: './facility-settings-owners.component.html',
  styleUrls: ['./facility-settings-owners.component.scss'],
})
export class FacilitySettingsOwnersComponent implements OnInit {
  @Output()
  ownerEmitter: EventEmitter<Owner[]> = new EventEmitter<Owner[]>();

  facility: Facility;
  owners: Owner[] = [];
  selection = new SelectionModel<Owner>(true, []);
  loading: boolean;
  filterValue: string;
  displayedColumns: string[] = ['id', 'name', 'contact', 'type'];
  tableId = TABLE_FACILITY_OWNERS;

  addAuth: boolean;
  removeAuth: boolean;

  constructor(
    private facilitiesManagerService: FacilitiesManagerService,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.filterValue = '';
    this.facility = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.selection.clear();
    this.facilitiesManagerService.getFacilityOwners(this.facility.id).subscribe((owners) => {
      this.owners = owners;
      this.ownerEmitter.emit(this.owners);
      this.loading = false;
    });
  }

  setAuthRights(): void {
    this.addAuth = this.authResolver.isAuthorized('addOwner_Facility_Owner_policy', [
      this.facility,
    ]);
    this.removeAuth = this.authResolver.isAuthorized('removeOwner_Facility_Owner_policy', [
      this.facility,
    ]);

    this.displayedColumns = this.removeAuth
      ? ['select', 'id', 'name', 'contact', 'type']
      : ['id', 'name', 'contact', 'type'];
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  onCreate(): void {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = {
      theme: 'facility-theme',
      facilityId: this.facility.id,
      forbiddenOwners: this.owners.map((owner) => owner.id),
    };

    const dialogRef = this.dialog.open(AddFacilityOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.refreshTable();
      }
    });
  }

  onRemove(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      theme: 'facility-theme',
      owners: this.selection.selected,
      facilityId: this.facility.id,
    };

    const dialogRef = this.dialog.open(RemoveFacilityOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.refreshTable();
      }
    });
  }
}
