import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  NotificatorService,
  PerunTranslateService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { MembersManagerService, RichMember, RichUser, User } from '@perun-web-apps/perun/openapi';

export interface SponsorThisMemberDialogData {
  theme: string;
  member: RichMember;
  sponsors: RichUser[];
}

@Component({
  selector: 'app-sponsor-this-member-dialog',
  templateUrl: './sponsor-this-member-dialog.components.html',
  styleUrls: ['./sponsor-this-member-dialog.components.scss'],
})
export class SponsorThisMemberDialogComponent implements OnInit {
  loading = false;
  theme: string;
  expiration = 'never';
  selectedSponsor: User = null;
  sponsorType = 'self';
  member: RichMember;
  sponsors: RichUser[];
  minDate = new Date();

  constructor(
    private dialogRef: MatDialogRef<SponsorThisMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SponsorThisMemberDialogData,
    private store: StoreService,
    private membersService: MembersManagerService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.member = this.data.member;
    this.sponsors = this.data.sponsors;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSponsor(): void {
    this.loading = true;
    this.expiration = this.expiration === 'never' ? null : this.expiration;

    const sponsor =
      this.sponsorType === 'self' ? this.store.getPerunPrincipal().user : this.selectedSponsor;

    this.membersService.sponsorMembers([this.member.id], sponsor.id, this.expiration).subscribe({
      next: () => {
        this.notificator.showSuccess(this.translate.instant('DIALOGS.SPONSOR_THIS_MEMBER.SUCCESS'));
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => (this.loading = false),
    });
  }

  setExpiration(newExpiration: string): void {
    this.expiration = newExpiration;
  }
}
