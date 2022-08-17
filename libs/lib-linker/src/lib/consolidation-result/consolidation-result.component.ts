import { Component, Input, OnChanges } from '@angular/core';
import { LinkerResult } from '../models/LinkerResult';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-consolidation-result',
  templateUrl: './consolidation-result.component.html',
  styleUrls: ['./consolidation-result.component.scss'],
})
export class ConsolidationResultComponent implements OnChanges {
  @Input()
  result: LinkerResult;
  supportMail = this.store.getProperty('support_mail');
  userMail: string = this.store.getPerunPrincipal().additionalInformations.mail;
  color = '';
  icon = '';

  greenColor = '#e0ffd4';
  blueColor = '#d4f2ff';
  redColor = '#ffd4d4';
  warningIcon = 'warning';
  infoIcon = 'info';
  messageSent = 'mark_email_read';

  constructor(private store: StoreService) {}

  ngOnChanges(): void {
    switch (this.result) {
      case 'OK':
        this.color = this.greenColor;
        break;
      case 'IDENTITY_REGISTERED_ALREADY':
        this.color = this.redColor;
        this.icon = this.warningIcon;
        break;
      case 'IDENTITY_IDENTICAL':
        this.color = this.blueColor;
        this.icon = this.infoIcon;
        break;
      case 'IDENTITY_LINKED':
        this.color = this.blueColor;
        this.icon = this.infoIcon;
        break;
      case 'IDENTITY_UNKNOWN':
        this.color = this.blueColor;
        this.icon = this.infoIcon;
        break;
      case 'MESSAGE_SENT_TO_SUPPORT':
        this.color = this.blueColor;
        this.icon = this.messageSent;
        break;
      case 'TOKEN_EXPIRED':
        this.color = this.blueColor;
        this.icon = this.warningIcon;
        break;
      case 'UNKNOWN_ERROR':
        this.color = this.redColor;
        this.icon = this.warningIcon;
        break;
    }
  }
}
