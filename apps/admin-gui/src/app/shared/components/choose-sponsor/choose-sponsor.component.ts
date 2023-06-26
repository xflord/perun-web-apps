import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Role } from '@perun-web-apps/perun/models';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { RichUser, User } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-choose-sponsor',
  templateUrl: './choose-sponsor.component.html',
  styleUrls: ['./choose-sponsor.component.scss'],
})
export class ChooseSponsorComponent implements OnInit, OnChanges {
  @Input() voId: number;
  @Input() voSponsors: RichUser[] = [];
  @Input() disableSelf = false;
  @Input() customTitle = 'DIALOGS.CREATE_SPONSORED_MEMBER.SELECT_SPONSOR_DEFAULT';
  @Output() sponsorTypeSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() sponsorSelected: EventEmitter<User> = new EventEmitter<User>();
  sponsorType = 'self';
  isSponsor = false;
  isPerunAdmin = false;
  selectedSponsor: User = null;
  selfTooltip = 'DIALOGS.CREATE_SPONSORED_MEMBER.SELECT_SELF_DISABLED';

  constructor(private guiAuthResolver: GuiAuthResolver) {}

  ngOnInit(): void {
    this.isSponsor = this.guiAuthResolver.principalHasRole(Role.SPONSOR, 'Vo', this.voId);
    this.isPerunAdmin = this.guiAuthResolver.isPerunAdmin();
    if (this.isSelfEnabled()) {
      this.selfTooltip = 'DIALOGS.CREATE_SPONSORED_MEMBER.SELECT_SELF_DISABLED_COPY';
    }
    this.updateSponsorType();
  }

  ngOnChanges(): void {
    this.updateSponsorType();
  }

  updateSponsorType(): void {
    this.sponsorType = this.isSelfEnabled() ? 'self' : 'other';
    this.emitSponsorType();
  }

  emitSponsorType(): void {
    if (this.sponsorType === 'self') {
      this.selectSponsor(null);
    }
    this.sponsorTypeSelected.emit(this.sponsorType);
  }

  selectSponsor(sponsor: User): void {
    this.selectedSponsor = sponsor;
    this.sponsorSelected.emit(sponsor);
  }

  isSelfEnabled(): boolean {
    return this.isSponsor && !this.disableSelf;
  }
}
