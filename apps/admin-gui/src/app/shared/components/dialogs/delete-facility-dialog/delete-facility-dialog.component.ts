import { Component, Inject, OnInit } from '@angular/core';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { DeleteDialogResult } from '@perun-web-apps/perun/dialogs';

export interface DeleteFacilityDialogData {
  theme: string;
  facility: Facility;
}

@Component({
  selector: 'app-delete-facility-dialog',
  templateUrl: './delete-facility-dialog.component.html',
  styleUrls: ['./delete-facility-dialog.component.scss'],
})
export class DeleteFacilityDialogComponent implements OnInit {
  theme: string;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Facility>;
  loading = false;
  relations: string[] = [];
  private facility: Facility;
  private force = false;

  constructor(
    private dialogRef: MatDialogRef<DeleteFacilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DeleteFacilityDialogData,
    public facilitiesManager: FacilitiesManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.facility = this.data.facility;
    this.dataSource = new MatTableDataSource<Facility>([this.facility]);
    this.relations.push(
      this.translate.instant('DIALOGS.DELETE_FACILITY.RESOURCE_RELATION') as string
    );
  }

  onConfirm(): void {
    this.loading = true;
    this.facilitiesManager.deleteFacility(this.facility.id, this.force).subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.DELETE_FACILITY.SUCCESS') as string
        );
        this.dialogRef.close(true);
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(result: DeleteDialogResult): void {
    this.force = result.force;
    if (result.deleted) {
      this.onConfirm();
    } else {
      this.onCancel();
    }
  }
}
