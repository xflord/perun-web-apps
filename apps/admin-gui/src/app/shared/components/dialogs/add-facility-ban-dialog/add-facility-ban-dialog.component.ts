import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { BanOnFacility, FacilitiesManagerService, RichUser } from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_BANS } from '@perun-web-apps/config/table-config';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddBanData, BanForm } from '../add-ban-dialog/add-ban-dialog.component';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-add-facility-ban-dialog',
  templateUrl: './add-facility-ban-dialog.component.html',
  styleUrls: ['./add-facility-ban-dialog.component.scss'],
})
export class AddFacilityBanDialogComponent implements OnInit {
  selection = new SelectionModel<RichUser>(false, []);
  ban: BanOnFacility;
  loading$: Observable<boolean>;
  loading = false;
  attrNames = [Urns.USER_DEF_PREFERRED_MAIL].concat(this.store.getLoginAttributeNames());
  displayedColumns = ['select', 'id', 'name', 'email', 'logins'];
  tableId = TABLE_BANS;
  filter = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddBanData<BanOnFacility>,
    private dialogRef: MatDialogRef<AddFacilityBanDialogComponent>,
    private store: StoreService,
    private facilityService: FacilitiesManagerService,
    private notificator: NotificatorService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading$ = of(true);
    this.selection.changed.subscribe((change) => {
      this.ban = this.data.bans.find((ban) => ban.userId === change.source.selected[0]?.id);
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submitBan(banForm: BanForm): void {
    if (!this.ban) {
      this.banUser(banForm);
    } else {
      this.updateBan(banForm);
    }
  }

  setFilter(filter: string): void {
    this.filter = filter;
    this.selection.clear();
    this.cd.detectChanges();
  }

  private banUser(banForm: BanForm): void {
    this.loading = true;
    this.facilityService
      .setFacilityBan({
        banOnFacility: {
          userId: this.selection.selected[0].id,
          facilityId: this.data.entityId,
          description: banForm.description,
          validityTo: banForm.validity,
          id: 0,
          beanName: 'BanOnVo',
        },
      })
      .subscribe({
        next: () => {
          this.notificator.showSuccess('DIALOGS.ADD_BAN.SUCCESS_USER');
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }

  private updateBan(banForm: BanForm): void {
    this.loading = true;
    this.facilityService
      .updateFacilityBan({
        banOnFacility: {
          id: this.ban.id,
          beanName: 'BanOnFacility',
          facilityId: this.ban.facilityId,
          userId: this.ban.userId,
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
