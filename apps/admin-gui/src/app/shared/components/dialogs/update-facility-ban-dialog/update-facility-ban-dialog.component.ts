import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { BanOnFacility, FacilitiesManagerService } from '@perun-web-apps/perun/openapi';
import { UpdateBanData } from '../update-ban-dialog/update-ban-dialog.component';
import { BanForm } from '../add-ban-dialog/add-ban-dialog.component';

@Component({
  selector: 'app-update-facility-ban-dialog',
  templateUrl: './update-facility-ban-dialog.component.html',
  styleUrls: ['./update-facility-ban-dialog.component.scss'],
})
export class UpdateFacilityBanDialogComponent {
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UpdateBanData<BanOnFacility>,
    private dialogRef: MatDialogRef<UpdateFacilityBanDialogComponent>,
    private facilityService: FacilitiesManagerService,
    private notificator: NotificatorService,
  ) {}

  update(banForm: BanForm): void {
    this.loading = true;
    this.facilityService
      .updateFacilityBan({
        banOnFacility: {
          id: this.data.ban.id,
          beanName: 'BanOnFacility',
          facilityId: this.data.ban.facilityId,
          userId: this.data.ban.userId,
          description: banForm.description,
          validityTo: banForm.validity,
        },
      })
      .subscribe({
        next: () => {
          this.notificator.showSuccess('DIALOGS.UPDATE_BAN.SUCCESS');
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
