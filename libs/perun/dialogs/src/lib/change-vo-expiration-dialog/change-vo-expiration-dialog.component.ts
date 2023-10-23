import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  MembersManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { iif, mergeMap, of, switchMap } from 'rxjs';

export interface ChangeVoExpirationDialogData {
  voId: number;
  memberId: number;
  expirationAttr: Attribute;
  status: string;
}

@Component({
  selector: 'perun-web-apps-change-vo-expiration-dialog',
  templateUrl: './change-vo-expiration-dialog.component.html',
  styleUrls: ['./change-vo-expiration-dialog.component.scss'],
})
export class ChangeVoExpirationDialogComponent implements OnInit {
  loading = false;
  expiration: string;
  status: string;
  canExtendMembership = false;
  private expirationAttr: Attribute = null;

  constructor(
    private dialogRef: MatDialogRef<ChangeVoExpirationDialogData>,
    @Inject(MAT_DIALOG_DATA) private data: ChangeVoExpirationDialogData,
    private attributesManagerService: AttributesManagerService,
    private memberManager: MembersManagerService,
    private notificator: NotificatorService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.status = this.data.status;

    this.expirationAttr = this.data.expirationAttr;
    this.expiration = (this.expirationAttr?.value as string) ?? 'never';

    if (this.data.status === 'VALID') {
      this.attributesManagerService
        .getVoAttributeByName(this.data.voId, Urns.VO_DEF_EXPIRATION_RULES)
        .pipe(
          switchMap((attr) => {
            if (!attr.value) return of(false);
            return this.memberManager.canExtendMembership(this.data.memberId);
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

    const extend$ = this.memberManager.extendMembership(this.data.memberId);
    const change$ = this.attributesManagerService.setMemberAttribute({
      member: this.data.memberId,
      attribute: this.expirationAttr,
    });

    of(newExp)
      .pipe(mergeMap((exp) => iif(() => exp === 'voRules', extend$, change$)))
      .subscribe({
        next: () => {
          this.loading = false;
          this.notificator.showInstantSuccess('DIALOGS.CHANGE_EXPIRATION.SUCCESS');
          this.dialogRef.close({ success: true });
        },
        error: () => (this.loading = false),
      });
  }
}
