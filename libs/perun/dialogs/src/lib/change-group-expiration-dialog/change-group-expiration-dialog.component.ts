import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  GroupsManagerService,
  MembersManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { iif, mergeMap, of, switchMap } from 'rxjs';

export interface ChangeGroupExpirationDialogData {
  groupId: number;
  memberId: number;
  expirationAttr: Attribute;
  status: string;
}

@Component({
  selector: 'perun-web-apps-change-group-expiration-dialog',
  templateUrl: './change-group-expiration-dialog.component.html',
  styleUrls: ['./change-group-expiration-dialog.component.scss'],
})
export class ChangeGroupExpirationDialogComponent implements OnInit {
  loading = false;
  expiration: string;
  status: string;
  canExtendMembership = false;
  private expirationAttr: Attribute = null;

  constructor(
    private dialogRef: MatDialogRef<ChangeGroupExpirationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ChangeGroupExpirationDialogData,
    private attributesManagerService: AttributesManagerService,
    private memberManager: MembersManagerService,
    private groupManager: GroupsManagerService,
    private translate: PerunTranslateService,
    private notificator: NotificatorService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.status = this.data.status;

    this.expirationAttr = this.data.expirationAttr;
    this.expiration = (this.expirationAttr?.value as string) ?? 'never';

    if (this.data.status === 'VALID') {
      this.attributesManagerService
        .getGroupAttributeByName(this.data.groupId, Urns.GROUP_DEF_EXPIRATION_RULES)
        .pipe(
          switchMap((attr) => {
            if (!attr.value) return of(false);
            return this.groupManager.canExtendMembershipInGroup(
              this.data.memberId,
              this.data.groupId,
            );
          }),
        )
        .subscribe({
          next: (canExtend) => {
            this.canExtendMembership = canExtend;
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
    } else {
      this.loading = false;
    }
  }

  onExpirationChanged(newExp: string): void {
    this.loading = true;
    this.expirationAttr.value = newExp === 'never' ? null : newExp;

    const extend$ = this.groupManager.extendMembershipInGroup(
      this.data.memberId,
      this.data.groupId,
    );
    const change$ = this.attributesManagerService.setMemberGroupAttributes({
      member: this.data.memberId,
      group: this.data.groupId,
      attributes: [this.expirationAttr],
    });

    of(newExp)
      .pipe(mergeMap((exp) => iif(() => exp === 'groupRules', extend$, change$)))
      .subscribe({
        next: () => {
          this.loading = false;
          this.notificator.showInstantSuccess('DIALOGS.CHANGE_EXPIRATION.SUCCESS');
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }
}
