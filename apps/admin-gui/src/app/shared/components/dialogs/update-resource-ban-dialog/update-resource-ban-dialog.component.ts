import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateBanData } from '../update-ban-dialog/update-ban-dialog.component';
import { BanOnResource, ResourcesManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { BanForm } from '../add-ban-dialog/add-ban-dialog.component';

@Component({
  selector: 'app-update-resource-ban-dialog',
  templateUrl: './update-resource-ban-dialog.component.html',
  styleUrls: ['./update-resource-ban-dialog.component.scss'],
})
export class UpdateResourceBanDialogComponent {
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UpdateBanData<BanOnResource>,
    private dialogRef: MatDialogRef<UpdateResourceBanDialogComponent>,
    private resourceService: ResourcesManagerService,
    private notificator: NotificatorService
  ) {}

  update(banForm: BanForm): void {
    this.loading = true;
    this.resourceService
      .updateResourceBan({
        banOnResource: {
          id: this.data.ban.id,
          beanName: 'BanOnFacility',
          resourceId: this.data.ban.resourceId,
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
