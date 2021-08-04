import { Component, Input } from '@angular/core';

export type AlertType = 'error' | 'warn' | "info";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {

  constructor() { }

  @Input()
  alert_type: AlertType;

}
