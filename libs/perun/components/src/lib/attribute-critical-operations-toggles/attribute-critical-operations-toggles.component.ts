import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-attribute-critical-operations-toggles',
  templateUrl: './attribute-critical-operations-toggles.component.html',
  styleUrls: ['./attribute-critical-operations-toggles.component.scss'],
})
export class AttributeCriticalOperationsTogglesComponent {
  @Input() readOperation = false;
  @Input() writeOperation = false;
  @Output() readOperationChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() writeOperationChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
}
