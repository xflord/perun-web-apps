import { Component, Input } from '@angular/core';

export type AlertType = 'error' | 'warn' | 'info' | 'success';

@Component({
  selector: 'perun-web-apps-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() alert_type: AlertType;
}
