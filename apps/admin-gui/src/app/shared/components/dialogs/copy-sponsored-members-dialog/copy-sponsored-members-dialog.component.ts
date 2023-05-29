import { Component, Inject, OnInit } from '@angular/core';
import {
  MembersManagerService,
  MemberWithSponsors,
  RichUser,
  User,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_ADD_SPONSORED_MEMBERS } from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';

export interface CopySponsoredMembersDialogData {
  voId: number;
  theme: string;
  voSponsors: RichUser[];
  findSponsorsAuth: boolean;
}
@Component({
  selector: 'app-copy-sponsored-members-dialog',
  templateUrl: './copy-sponsored-members-dialog.component.html',
  styleUrls: ['./copy-sponsored-members-dialog.component.scss'],
})
export class CopySponsoredMembersDialogComponent implements OnInit {
  loading = false;
  tableLoading = false;
  theme: string;
  sponsorType: 'self' | 'other' = 'self';
  tableId = TABLE_ADD_SPONSORED_MEMBERS;
  voSponsorsTarget: RichUser[];
  voSponsorsSource: RichUser[];
  sourceSponsor: User;
  targetSponsor: User;
  sponsoredMembers: MemberWithSponsors[];
  filteredSponsoredMembers: MemberWithSponsors[];
  selection: SelectionModel<MemberWithSponsors> = new SelectionModel<MemberWithSponsors>(true, []);
  sourceSponsorSelected = false;
  filter: string;
  expiration = 'never';
  minDate = new Date();
  pickExpiration = false;
  disableSelf = false;
  isPerunAdmin = false;
  private attrNames: string[] = [Urns.USER_DEF_PREFERRED_MAIL];
  constructor(
    private dialogRef: MatDialogRef<CopySponsoredMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CopySponsoredMembersDialogData,
    private store: StoreService,
    private membersService: MembersManagerService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private auth: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.attrNames = this.attrNames.concat(this.store.getLoginAttributeNames());
    this.membersService
      .getAllSponsoredMembersAndTheirSponsors(this.data.voId, this.attrNames)
      .subscribe({
        next: (members) => {
          this.sponsoredMembers = members;
        },
      });
    this.voSponsorsTarget = this.data.voSponsors;
    this.voSponsorsSource = this.data.voSponsors;
    this.isPerunAdmin = this.auth.isPerunAdmin();
    // if not PERUNADMIN user cannot copy to anyone else than self, so do not allow selecting self as source sponsor
    if (!this.isPerunAdmin) {
      this.voSponsorsSource = this.voSponsorsSource.filter(
        (voSponsor) => voSponsor.id !== this.store.getPerunPrincipal().user.id
      );
    }
    this.theme = this.data.theme;
  }

  sourceSponsorChanged(user: User): void {
    this.tableLoading = true;
    this.sourceSponsor = user;
    this.voSponsorsTarget = this.data.voSponsors.filter(
      (sponsor) => sponsor.id !== this.sourceSponsor.id
    );
    // disable copying to self only if PERUNADMIN (it is not possible to choose self as source sponsor without PERUNADMIN anyway)
    if (this.isPerunAdmin) {
      this.disableSelf = this.store.getPerunPrincipal().user.id === this.sourceSponsor.id;
    }
    this.sourceSponsorSelected = true;
    this.selection.clear();
    this.filteredSponsoredMembers = this.sponsoredMembers.filter((member) =>
      member.sponsors.map((sponsor) => sponsor.user.id).includes(this.sourceSponsor.id)
    );
    this.tableLoading = false;
  }

  sponsor(members: MemberWithSponsors[]): void {
    const sponsor =
      this.sponsorType === 'self' ? this.store.getPerunPrincipal().user : this.targetSponsor;

    const memberIds = members.map((member) => member.member.id);

    this.membersService
      .copySponsoredMembers(
        memberIds,
        this.sourceSponsor.id,
        sponsor.id,
        !this.pickExpiration,
        this.expiration
      )
      .subscribe({
        next: () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.COPY_SPONSORED_MEMBERS.SUCCESS')
          );
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }

  submit(): void {
    this.loading = true;
    this.expiration = this.expiration === 'never' ? null : this.expiration;

    this.sponsor(this.selection.selected);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
