import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-membership-status-settings',
  templateUrl: './membership-status-settings.component.html',
  styleUrls: ['./membership-status-settings.component.scss'],
})
export class MembershipStatusSettingsComponent {
  @Input() status = '';
  @Input() expiration: string;
  @Input() showExpiration = true;
  @Input() editExpirationAuth = false;
  @Input() editStatusAuth = false;
  @Output() changeStatus = new EventEmitter<void>();
  @Output() changeExpiration = new EventEmitter<void>();

  onChangeStatus(): void {
    this.changeStatus.emit();
  }

  onChangeExpiration(): void {
    this.changeExpiration.emit();
  }
}
