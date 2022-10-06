import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Role } from '@perun-web-apps/perun/models';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { RichUser, User } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-choose-sponsor',
  templateUrl: './choose-sponsor.component.html',
  styleUrls: ['./choose-sponsor.component.scss'],
})
export class ChooseSponsorComponent implements OnInit {
  @Input() voId: number;
  @Input() voSponsors: RichUser[] = [];
  @Output() sponsorTypeSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() sponsorSelected: EventEmitter<User> = new EventEmitter<User>();
  sponsorType = 'self';
  isSponsor = false;
  isPerunAdmin = false;
  selectedSponsor: User = null;

  constructor(private guiAuthResolver: GuiAuthResolver) {}

  ngOnInit(): void {
    this.isSponsor = this.guiAuthResolver.principalHasRole(Role.SPONSOR, 'Vo', this.voId);
    this.isPerunAdmin = this.guiAuthResolver.isPerunAdmin();
    this.sponsorType = this.isSponsor ? 'self' : 'other';
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
}
