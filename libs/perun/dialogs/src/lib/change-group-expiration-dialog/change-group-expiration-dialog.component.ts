import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  GroupsManagerService,
  MembersManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';

export interface ChangeGroupExpirationDialogData {
  groupId: number;
  memberId: number;
  expirationAttr: Attribute;
  status: string;
  backButton?: boolean;
}

@Component({
  selector: 'perun-web-apps-change-group-expiration-dialog',
  templateUrl: './change-group-expiration-dialog.component.html',
  styleUrls: ['./change-group-expiration-dialog.component.scss'],
})
export class ChangeGroupExpirationDialogComponent implements OnInit {
  loading = false;
  maxDate: Date;
  minDate: Date;
  currentExpiration: string;
  newExpiration: string;
  status: string;
  canExtendMembership = false;
  changeStatus: boolean;
  backButton: boolean;
  private successMessage: string;
  private expirationAttr: Attribute = null;

  constructor(
    private dialogRef: MatDialogRef<ChangeGroupExpirationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ChangeGroupExpirationDialogData,
    private attributesManagerService: AttributesManagerService,
    private memberManager: MembersManagerService,
    private groupManager: GroupsManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService
  ) {
    translate
      .get('DIALOGS.CHANGE_EXPIRATION.SUCCESS')
      .subscribe((res: string) => (this.successMessage = res));
  }

  ngOnInit(): void {
    this.status = this.data.status;
    this.backButton = this.data.backButton;
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

    if (this.data.status === 'VALID') {
      this.attributesManagerService
        .getGroupAttributeByName(this.data.groupId, Urns.GROUP_DEF_EXPIRATION_RULES)
        .subscribe({
          next: (attr) => {
            if (attr.value !== null) {
              this.groupManager
                .canExtendMembershipInGroup(this.data.memberId, this.data.groupId)
                .subscribe({
                  next: (canExtend) => {
                    this.canExtendMembership = !!canExtend;
                    this.loading = false;
                  },
                  error: () => (this.loading = false),
                });
            } else {
              this.loading = false;
            }
          },
          error: () => (this.loading = false),
        });
    } else {
      this.loading = false;
    }
  }

  onExpirationChanged(newExp: string): void {
    this.loading = true;
    if (newExp === 'groupRules') {
      this.groupManager.extendMembershipInGroup(this.data.memberId, this.data.groupId).subscribe({
        next: () => {
          this.loading = false;
          this.notificator.showSuccess(this.successMessage);
          this.dialogRef.close({ success: true });
        },
        error: () => (this.loading = false),
      });
    } else {
      this.expirationAttr.value = newExp === 'never' ? null : newExp;

      this.attributesManagerService
        .setMemberGroupAttributes({
          member: this.data.memberId,
          group: this.data.groupId,
          attributes: [this.expirationAttr],
        })
        .subscribe({
          next: () => {
            if (this.changeStatus && this.status === 'EXPIRED') {
              this.groupManager
                .setGroupsMemberStatus(this.data.memberId, this.data.groupId, 'VALID')
                .subscribe({
                  next: (member) => {
                    this.translate
                      .get('DIALOGS.CHANGE_STATUS.SUCCESS')
                      .subscribe((success: string) => {
                        this.notificator.showSuccess(success);
                        this.loading = false;
                        this.notificator.showSuccess(this.successMessage);
                        this.dialogRef.close({ success: true, member: member });
                      });
                  },
                  error: () => (this.loading = false),
                });
            } else {
              this.loading = false;
              this.notificator.showSuccess(this.successMessage);
              this.dialogRef.close({ success: true });
            }
          },
          error: () => (this.loading = false),
        });
    }
  }
}
