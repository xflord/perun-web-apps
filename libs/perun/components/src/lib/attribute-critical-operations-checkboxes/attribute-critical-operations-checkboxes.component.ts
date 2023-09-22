import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-attribute-critical-operations-checkboxes',
  templateUrl: './attribute-critical-operations-checkboxes.component.html',
  styleUrls: ['./attribute-critical-operations-checkboxes.component.scss'],
})
export class AttributeCriticalOperationsCheckboxesComponent {
  @Input() attDef: AttributeDefinition;
  @Input() readOperation = false;
  @Input() readGlobal = false;
  @Input() writeOperation = true;
  @Input() writeGlobal = false;
  @Output() readOperationChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() readGlobalChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() writeOperationChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() writeGlobalChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  changeReadOperation(): void {
    this.readOperationChanged.emit(this.readOperation);
    // if the operation is changing from true to false, then we want to change also global criticality to false
    if (!this.readOperation) {
      this.readGlobal = false;
      this.readGlobalChanged.emit(this.readGlobal);
    }
  }

  changeWriteOperation(): void {
    this.writeOperationChanged.emit(this.writeOperation);
    // if the operation is changing from true to false, then we want to change also global criticality to false
    if (!this.writeOperation) {
      this.writeGlobal = false;
      this.writeGlobalChanged.emit(this.writeGlobal);
    }
  }
}
