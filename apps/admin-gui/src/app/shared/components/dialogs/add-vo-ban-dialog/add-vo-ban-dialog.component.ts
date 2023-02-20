import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { BanOnVo, RichMember, VosManagerService } from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_BANS } from '@perun-web-apps/config/table-config';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { AddBanData, BanForm } from '../add-ban-dialog/add-ban-dialog.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-add-vo-ban-dialog',
  templateUrl: './add-vo-ban-dialog.component.html',
  styleUrls: ['./add-vo-ban-dialog.component.scss'],
})
export class AddVoBanDialogComponent implements OnInit {
  selection = new SelectionModel<RichMember>(false, []);
  ban: BanOnVo;
  loading = false;
  attrNames = [Urns.MEMBER_DEF_MAIL, Urns.USER_DEF_PREFERRED_MAIL].concat(
    this.store.getLoginAttributeNames()
  );
  displayedColumns = ['checkbox', 'id', 'fullName', 'email', 'logins'];
  tableId = TABLE_BANS;
  filter = '';
  loading$: Observable<boolean> = of(true);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddBanData<BanOnVo>,
    private dialogRef: MatDialogRef<AddVoBanDialogComponent>,
    private store: StoreService,
    private voService: VosManagerService,
    private notificator: NotificatorService
  ) {}

  ngOnInit(): void {
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

  setFilter(filter: string): void {
    this.filter = filter;
    this.selection.clear();
  }

  private banMember(banForm: BanForm): void {
    this.loading = true;
    this.voService
      .setVoBan({
        banOnVo: {
          memberId: this.selection.selected[0].id,
          description: banForm.description,
          validityTo: banForm.validity,
          id: 0,
          beanName: 'BanOnVo',
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
    this.voService
      .updateVoBan({
        banOnVo: {
          id: this.ban.id,
          beanName: 'BanOnVo',
          voId: this.ban.voId,
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
