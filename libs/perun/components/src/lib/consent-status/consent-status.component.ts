import { Component, Input } from '@angular/core';

@Component({
  selector: 'perun-web-apps-consent-status',
  templateUrl: './consent-status.component.html',
  styleUrls: ['./consent-status.component.scss'],
})
export class ConsentStatusComponent {
  constructor() {}

  @Input()
  consentStatus: string;
}
