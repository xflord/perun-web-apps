import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  GroupsManagerService,
  MembersManagerService,
  RichMember,
} from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';

export interface ChangeMemberStatusDialogData {
  member: RichMember;
  voId?: number;
  groupId?: number;
  disableChangeExpiration?: boolean;
}

@Component({
  selector: 'perun-web-apps-change-member-status-dialog',
  templateUrl: './change-member-status-dialog.component.html',
  styleUrls: ['./change-member-status-dialog.component.scss'],
})
export class ChangeMemberStatusDialogComponent implements OnInit {
  loading = false;
  theme: string;

  allStatuses: string[] = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  actualStatus: string;
  selectedStatus: string;
  description: string;
  changeMessage: string;
  submitButtonText: string;
  private changeStatusButton: string;
  private changeStatusWithExpButton: string;

  constructor(
    public dialogRef: MatDialogRef<ChangeMemberStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeMemberStatusDialogData,
    private memberManager: MembersManagerService,
    private groupsManager: GroupsManagerService,
    private notificatorService: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.data.groupId) {
      this.theme = 'group-theme';
      this.actualStatus = this.data.member.groupStatus;
    } else {
      this.theme = 'vo-theme';
      this.actualStatus = this.data.member.status;
    }

    this.changeStatusButton = this.translate.instant(
      'DIALOGS.CHANGE_STATUS.CHANGE_STATUS'
    ) as string;
    this.changeStatusWithExpButton = this.translate.instant(
      'DIALOGS.CHANGE_STATUS.CHANGE_STATUS_WITH_EXPIRATION'
    ) as string;
    this.submitButtonText = this.changeStatusButton;

    if (this.data.groupId) {
      if (this.actualStatus === 'VALID') {
        this.allStatuses = ['EXPIRED'];
        this.selectedStatus = 'EXPIRED';
      } else {
        this.allStatuses = ['VALID'];
        this.selectedStatus = 'VALID';
      }
      this.submitButtonText = this.changeStatusWithExpButton;
      this.changeStatusMessage(this.actualStatus, this.selectedStatus);
    } else {
      if (this.actualStatus === 'INVALID') {
        this.allStatuses = ['VALID', 'EXPIRED'];
      } else {
        this.allStatuses = this.allStatuses.filter((status) => status !== this.actualStatus);
      }
    }

    switch (this.actualStatus) {
      case 'VALID':
        this.description = this.translate.instant(
          'DIALOGS.CHANGE_STATUS.VALID_DESCRIPTION'
        ) as string;
        break;
      case 'INVALID':
        this.description = this.translate.instant(
          'DIALOGS.CHANGE_STATUS.INVALID_DESCRIPTION'
        ) as string;
        break;
      case 'EXPIRED':
        this.description = this.translate.instant(
          'DIALOGS.CHANGE_STATUS.EXPIRED_DESCRIPTION'
        ) as string;
        break;
      case 'DISABLED':
        this.description = this.translate.instant(
          'DIALOGS.CHANGE_STATUS.DISABLED_DESCRIPTION'
        ) as string;
        break;
      default:
        this.description = '';
    }
  }

  changeStatus(event: MatSelectChange): void {
    this.selectedStatus = event.value as string;
    if (
      ((this.actualStatus === 'VALID' && this.selectedStatus === 'EXPIRED') ||
        (this.actualStatus === 'VALID' && this.selectedStatus === 'DISABLED') ||
        this.selectedStatus === 'VALID') &&
      !this.data.disableChangeExpiration
    ) {
      this.submitButtonText = this.changeStatusWithExpButton;
    } else {
      this.submitButtonText = this.changeStatusButton;
    }
    this.changeStatusMessage(this.actualStatus, this.selectedStatus);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.loading = true;
    if (!this.data.groupId) {
      this.memberManager.setStatus(this.data.member.id, this.selectedStatus).subscribe(
        (member) => {
          this.translate.get('DIALOGS.CHANGE_STATUS.SUCCESS').subscribe((success: string) => {
            this.notificatorService.showSuccess(success);
            this.dialogRef.close(member);
          });
        },
        () => (this.loading = false)
      );
    } else {
      this.groupsManager
        .setGroupsMemberStatus(this.data.member.id, this.data.groupId, this.selectedStatus)
        .subscribe(
          (member) => {
            this.translate.get('DIALOGS.CHANGE_STATUS.SUCCESS').subscribe((success: string) => {
              this.notificatorService.showSuccess(success);
              this.dialogRef.close(member);
            });
          },
          () => (this.loading = false)
        );
    }
  }

  private changeStatusMessage(actualStatus: string, newStatus: string): void {
    if (actualStatus === 'VALID') {
      switch (newStatus) {
        case 'INVALID':
          this.changeMessage = this.translate.instant(
            'DIALOGS.CHANGE_STATUS.CHANGE_VALID_TO_INVALID'
          ) as string;
          break;
        case 'EXPIRED':
          this.changeMessage = this.translate.instant(
            'DIALOGS.CHANGE_STATUS.CHANGE_VALID_TO_EXPIRED'
          ) as string;
          break;
        case 'DISABLED':
          this.changeMessage = this.translate.instant(
            'DIALOGS.CHANGE_STATUS.CHANGE_VALID_TO_DISABLED'
          ) as string;
          break;
        default:
          this.changeMessage = '';
      }
    } else {
      switch (newStatus) {
        case 'VALID':
          this.changeMessage = this.translate.instant(
            'DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_VALID'
          ) as string;
          break;
        case 'INVALID':
          this.changeMessage = this.translate.instant(
            'DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_INVALID'
          ) as string;
          break;
        case 'EXPIRED':
          this.changeMessage = this.translate.instant(
            'DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_EXPIRED'
          ) as string;
          break;
        case 'DISABLED':
          this.changeMessage = this.translate.instant(
            'DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_DISABLED'
          ) as string;
          break;
        default:
          this.changeMessage = '';
      }
    }
  }
}
