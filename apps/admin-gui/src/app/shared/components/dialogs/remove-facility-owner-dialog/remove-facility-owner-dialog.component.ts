import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { FacilitiesManagerService, Owner } from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';

interface RemoveFacilityOwnerDialogData {
  theme: string;
  owners: Owner[];
  facilityId: number;
}

@Component({
  selector: 'app-remove-facility-owner-dialog',
  templateUrl: './remove-facility-owner-dialog.component.html',
  styleUrls: ['./remove-facility-owner-dialog.component.scss'],
})
export class RemoveFacilityOwnerDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Owner>;
  successMessage: string;
  loading: boolean;
  theme: string;

  constructor(
    public dialogRef: MatDialogRef<RemoveFacilityOwnerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveFacilityOwnerDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private facilitiesManagerService: FacilitiesManagerService
  ) {
    translate
      .get('DIALOGS.REMOVE_OWNERS.SUCCESS')
      .subscribe((res: string) => (this.successMessage = res));
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Owner>(this.data.owners);
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    if (this.data.owners.length !== 0) {
      this.facilitiesManagerService
        .removeFacilityOwner(this.data.facilityId, this.data.owners.pop().id)
        .subscribe(
          () => this.onSubmit(),
          () => (this.loading = false)
        );
    } else {
      this.loading = false;
      this.notificator.showSuccess(this.successMessage);
      this.dialogRef.close(true);
    }
  }
}
