import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
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
    private translate: PerunTranslateService,
    private facilitiesManagerService: FacilitiesManagerService,
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Owner>(this.data.owners);
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;

    const ownerIds = this.data.owners.map((owner) => owner.id);

    this.facilitiesManagerService.removeFacilityOwners(this.data.facilityId, ownerIds).subscribe({
      next: () => {
        this.loading = false;
        this.notificator.showSuccess(this.translate.instant('DIALOGS.REMOVE_OWNERS.SUCCESS'));
        this.dialogRef.close(true);
      },
      error: () => (this.loading = false),
    });
  }
}
