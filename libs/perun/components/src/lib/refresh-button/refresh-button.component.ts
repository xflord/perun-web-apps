import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
})
export class RefreshButtonComponent {
  @Output() refresh = new EventEmitter<MouseEvent>();
  @Input() disabled: boolean;

  onClickbutton(event: MouseEvent): void {
    this.refresh.emit(event);
  }
}
