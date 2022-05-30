import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  MembersManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { formatDate } from '@angular/common';
import { Urns } from '@perun-web-apps/perun/urns';

export interface ChangeVoExpirationDialogData {
  voId?: number;
  memberId: number;
  expirationAttr: Attribute;
  status: string;
  statusChanged?: boolean;
}

@Component({
  selector: 'perun-web-apps-change-vo-expiration-dialog',
  templateUrl: './change-vo-expiration-dialog.component.html',
  styleUrls: ['./change-vo-expiration-dialog.component.scss'],
})
export class ChangeVoExpirationDialogComponent implements OnInit {
  loading = false;
  maxDate: Date;
  minDate: Date;
  currentExpiration: string;
  newExpiration: string;
  status: string;
  canExtendMembership = false;
  changeStatus: boolean;
  successMessage: string;
  private expirationAttr: Attribute = null;

  constructor(
    private dialogRef: MatDialogRef<ChangeVoExpirationDialogData>,
    @Inject(MAT_DIALOG_DATA) private data: ChangeVoExpirationDialogData,
    private attributesManagerService: AttributesManagerService,
    private memberManager: MembersManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService
  ) {
    translate
      .get('DIALOGS.CHANGE_EXPIRATION.SUCCESS')
      .subscribe((res: string) => (this.successMessage = res));
  }

  ngOnInit(): void {
    this.status = this.data.status;
    this.loading = true;
    const currentDate = new Date();
    if (this.data.status !== 'VALID') {
      this.maxDate =
        this.data.status === 'EXPIRED'
          ? undefined
          : new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    } else {
      this.minDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
    }

    this.expirationAttr = this.data.expirationAttr;
    this.currentExpiration = (this.expirationAttr?.value as string) ?? 'never';
    this.newExpiration = this.currentExpiration;

    if (this.data.statusChanged) {
      if (this.data.status !== 'VALID') {
        this.newExpiration = formatDate(currentDate, 'yyyy-MM-dd', 'en');
        this.maxDate = currentDate;
      } else {
        this.newExpiration = 'never';
      }
    }

    if (this.data.status === 'VALID') {
      this.attributesManagerService
        .getVoAttributeByName(this.data.voId, Urns.VO_DEF_EXPIRATION_RULES)
        .subscribe(
          (attr) => {
            if (attr.value !== null) {
              this.memberManager.canExtendMembership(this.data.memberId).subscribe(
                (canExtend) => {
                  this.canExtendMembership = !!canExtend;
                  this.loading = false;
                },
                () => (this.loading = false)
              );
            } else {
              this.loading = false;
            }
          },
          () => (this.loading = false)
        );
    } else {
      this.loading = false;
    }
  }

  onExpirationChanged(newExp: string): void {
    this.loading = true;
    if (newExp === 'voRules') {
      this.memberManager.extendMembership(this.data.memberId).subscribe(
        () => {
          this.loading = false;
          this.notificator.showSuccess(this.successMessage);
          this.dialogRef.close({ success: true });
        },
        () => (this.loading = false)
      );
    } else {
      this.expirationAttr.value = newExp === 'never' ? null : newExp;

      this.attributesManagerService
        .setMemberAttribute({
          member: this.data.memberId,
          attribute: this.expirationAttr,
        })
        .subscribe(
          () => {
            if (this.changeStatus && this.status === 'EXPIRED') {
              this.memberManager.setStatus(this.data.memberId, 'VALID').subscribe(
                (member) => {
                  this.translate
                    .get('DIALOGS.CHANGE_STATUS.SUCCESS')
                    .subscribe((success: string) => {
                      this.notificator.showSuccess(success);
                      this.loading = false;
                      this.notificator.showSuccess(this.successMessage);
                      this.dialogRef.close({ success: true, member: member });
                    });
                },
                () => (this.loading = false)
              );
            } else {
              this.loading = false;
              this.notificator.showSuccess(this.successMessage);
              this.dialogRef.close({ success: true });
            }
          },
          () => (this.loading = false)
        );
    }
  }
}
