import { Component, Input } from '@angular/core';

@Component({
  selector: 'perun-web-apps-application-type-icon',
  templateUrl: './application-type-icon.component.html',
  styleUrls: ['./application-type-icon.component.css'],
})
export class ApplicationTypeIconComponent {
  @Input()
  applicationType: string;
}
