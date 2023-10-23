import { Component, Inject, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { BanOnResource, ResourcesManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { TABLE_BANS } from '@perun-web-apps/config/table-config';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { BanForm, AddBanData } from '../add-ban-dialog/add-ban-dialog.component';

@Component({
  selector: 'app-add-resource-ban-dialog',
  templateUrl: './add-resource-ban-dialog.component.html',
  styleUrls: ['./add-resource-ban-dialog.component.scss'],
})
export class AddResourceBanDialogComponent implements OnInit {
  selection = new SelectionModel<RichMember>(false, []);
  ban: BanOnResource;
  loading = false;
  displayedColumns = ['checkbox', 'id', 'fullName', 'organization', 'email', 'logins'];
  members: RichMember[] = [];
  tableId = TABLE_BANS;
  filter = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddBanData<BanOnResource>,
    private dialogRef: MatDialogRef<AddResourceBanDialogComponent>,
    private store: StoreService,
    private resourceService: ResourcesManagerService,
    private notificator: NotificatorService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resourceService.getAssignedRichMembers(this.data.entityId).subscribe({
      next: (members) => {
        this.members = members;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.selection.changed.subscribe((change) => {
      this.ban = this.data.bans.find((ban) => ban.memberId === change.source.selected[0]?.id);
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submitBan(banForm: BanForm): void {
    if (!this.ban) {
      this.banMember(banForm);
    } else {
      this.updateBan(banForm);
    }
  }

  private banMember(banForm: BanForm): void {
    this.loading = true;
    this.resourceService
      .setResourceBan({
        banOnResource: {
          memberId: this.selection.selected[0].id,
          resourceId: this.data.entityId,
          description: banForm.description,
          validityTo: banForm.validity,
          id: 0,
          beanName: 'BanOnResource',
        },
      })
      .subscribe({
        next: () => {
          this.notificator.showSuccess('DIALOGS.ADD_BAN.SUCCESS_MEMBER');
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }

  private updateBan(banForm: BanForm): void {
    this.loading = true;
    this.resourceService
      .updateResourceBan({
        banOnResource: {
          id: this.ban.id,
          beanName: 'BanOnFacility',
          resourceId: this.ban.resourceId,
          memberId: this.ban.memberId,
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
}
