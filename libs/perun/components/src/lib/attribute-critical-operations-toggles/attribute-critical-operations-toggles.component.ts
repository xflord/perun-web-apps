import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-attribute-critical-operations-toggles',
  templateUrl: './attribute-critical-operations-toggles.component.html',
  styleUrls: ['./attribute-critical-operations-toggles.component.scss'],
})
export class AttributeCriticalOperationsTogglesComponent {
  @Input() readOperation = false;
  @Input() readGlobal = false;
  @Input() writeOperation = true;
  @Input() writeGlobal = false;
  @Output() readOperationChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() readGlobalChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() writeOperationChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() writeGlobalChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  changeReadOperation(): void {
    this.readOperationChanged.emit(!this.readOperation);
    // if the operation is changing from true to false, then we want to change also global criticality to false
    if (this.readOperation) {
      this.readGlobal = false;
      this.readGlobalChanged.emit(this.readGlobal);
    }
  }

  changeWriteOperation(): void {
    this.writeOperationChanged.emit(!this.writeOperation);
    // if the operation is changing from true to false, then we want to change also global criticality to false
    if (this.writeOperation) {
      this.writeGlobal = false;
      this.writeGlobalChanged.emit(this.writeGlobal);
    }
  }
}
