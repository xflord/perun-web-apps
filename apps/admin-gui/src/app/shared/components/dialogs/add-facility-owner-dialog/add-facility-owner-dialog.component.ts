import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ExtSource,
  FacilitiesManagerService,
  Owner,
  OwnersManagerService,
} from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TABLE_ADD_EXTSOURCE_DIALOG } from '@perun-web-apps/config/table-config';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';

interface AddFacilityOwnerDialogData {
  theme: string;
  facilityId: number;
  forbiddenOwners: number[];
}

@Component({
  selector: 'app-add-facility-owner-dialog',
  templateUrl: './add-facility-owner-dialog.component.html',
  styleUrls: ['./add-facility-owner-dialog.component.scss'],
})
export class AddFacilityOwnerDialogComponent implements OnInit {
  theme: string;
  extSources: ExtSource[] = [];
  selection = new SelectionModel<Owner>(true, []);
  loading: boolean;
  filterValue = '';
  successMessage: string;
  tableId = TABLE_ADD_EXTSOURCE_DIALOG;
  owners: Owner[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddFacilityOwnerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddFacilityOwnerDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private ownersManagerService: OwnersManagerService,
    private facilitiesManagerService: FacilitiesManagerService
  ) {
    this.translate
      .get('DIALOGS.ADD_OWNERS.SUCCESS')
      .subscribe((result: string) => (this.successMessage = result));
  }

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.loading = true;
    this.ownersManagerService.getAllOwners().subscribe(
      (owners) => {
        this.owners = owners.filter((owner) => !this.data.forbiddenOwners.includes(owner.id));
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  onAdd(): void {
    this.loading = true;
    if (this.selection.selected.length !== 0) {
      this.facilitiesManagerService
        .addFacilityOwner(this.data.facilityId, this.selection.selected.pop().id)
        .subscribe(
          () => this.onAdd(),
          () => (this.loading = false)
        );
    } else {
      this.loading = false;
      this.notificator.showSuccess(this.successMessage);
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
