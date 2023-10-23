import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateBanData } from '../update-ban-dialog/update-ban-dialog.component';
import { BanOnVo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { BanForm } from '../add-ban-dialog/add-ban-dialog.component';

@Component({
  selector: 'app-update-vo-ban-dialog',
  templateUrl: './update-vo-ban-dialog.component.html',
  styleUrls: ['./update-vo-ban-dialog.component.scss'],
})
export class UpdateVoBanDialogComponent {
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UpdateBanData<BanOnVo>,
    private dialogRef: MatDialogRef<UpdateVoBanDialogComponent>,
    private voService: VosManagerService,
    private notificator: NotificatorService,
  ) {}

  update(banForm: BanForm): void {
    this.loading = true;
    this.voService
      .updateVoBan({
        banOnVo: {
          id: this.data.ban.id,
          beanName: 'BanOnVo',
          voId: this.data.ban.voId,
          memberId: this.data.ban.memberId,
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
