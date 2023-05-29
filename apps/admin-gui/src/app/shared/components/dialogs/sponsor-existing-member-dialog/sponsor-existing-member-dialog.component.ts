import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  NotificatorService,
  PerunTranslateService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { MembersManagerService, RichMember, RichUser, User } from '@perun-web-apps/perun/openapi';
import { UntypedFormControl, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_ADD_SPONSORED_MEMBERS } from '@perun-web-apps/config/table-config';

export interface SponsorExistingMemberDialogData {
  voId: number;
  theme: string;
  voSponsors: RichUser[];
  findSponsorsAuth: boolean;
  serviceMemberId?: number;
}

@Component({
  selector: 'app-sponsor-existing-member-dialog',
  templateUrl: './sponsor-existing-member-dialog.component.html',
  styleUrls: ['./sponsor-existing-member-dialog.component.scss'],
})
export class SponsorExistingMemberDialogComponent implements OnInit {
  loading = false;
  theme: string;
  tableId = TABLE_ADD_SPONSORED_MEMBERS;
  displayedColumns: string[];
  expiration = 'never';
  searchCtrl: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  firstSearchDone = false;
  members: RichMember[] = [];
  selection: SelectionModel<RichMember> = new SelectionModel<RichMember>(true, []);
  serviceMemberId: number;
  selectedSponsor: User = null;
  sponsorType = 'self';
  minDate = new Date();

  constructor(
    private dialogRef: MatDialogRef<SponsorExistingMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SponsorExistingMemberDialogData,
    private store: StoreService,
    private membersService: MembersManagerService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.serviceMemberId = this.data.serviceMemberId;
    this.displayedColumns = this.serviceMemberId
      ? ['checkbox', 'id', 'fullName', 'sponsored', 'email']
      : ['checkbox', 'id', 'fullName', 'status', 'sponsored', 'email'];
    if (this.serviceMemberId) {
      this.searchCtrl.setValue(this.serviceMemberId);
      this.onSearchByString();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  sponsor(members: RichMember[]): void {
    this.loading = true;

    const sponsor =
      this.sponsorType === 'self' ? this.store.getPerunPrincipal().user : this.selectedSponsor;

    const memberIds = members.map((member) => member.id);

    this.membersService.sponsorMembers(memberIds, sponsor.id, this.expiration).subscribe({
      next: () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.SPONSOR_EXISTING_MEMBER.SUCCESS')
        );
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => (this.loading = false),
    });
  }

  onSubmit(): void {
    this.loading = true;
    const members = Array.from(this.selection.selected);
    this.expiration = this.expiration === 'never' ? null : this.expiration;

    this.sponsor(members);
  }

  setExpiration(newExpiration: string): void {
    this.expiration = newExpiration;
  }

  onSearchByString(): void {
    if (this.searchCtrl.invalid) {
      this.searchCtrl.markAllAsTouched();
      return;
    }
    this.firstSearchDone = true;
    this.loading = true;

    this.selection.clear();
    this.cd.detectChanges();

    const attrNames = [Urns.MEMBER_DEF_EXPIRATION, Urns.USER_DEF_PREFERRED_MAIL];
    this.membersService
      .findCompleteRichMembersForVo(this.data.voId, attrNames, this.searchCtrl.value as string)
      .subscribe({
        next: (members) => {
          this.members = members;
          if (this.serviceMemberId) {
            this.selection.toggle(members[0]);
          }
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }
}
