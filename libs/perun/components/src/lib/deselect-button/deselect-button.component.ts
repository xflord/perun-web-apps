import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-deselect-button',
  templateUrl: './deselect-button.component.html',
  styleUrls: ['./deselect-button.component.scss'],
})
export class DeselectButtonComponent {
  @Output() deselect = new EventEmitter<MouseEvent>();

  onClickButton(event: MouseEvent): void {
    this.deselect.emit(event);
  }
}
