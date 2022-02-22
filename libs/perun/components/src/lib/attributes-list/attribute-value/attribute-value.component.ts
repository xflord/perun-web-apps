import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AttributeValueMapComponent } from './attribute-value-map/attribute-value-map.component';
import { Attribute } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-attribute-value',
  templateUrl: './attribute-value.component.html',
  styleUrls: ['./attribute-value.component.scss'],
})
export class AttributeValueComponent {
  @ViewChild('map') mapComponent: AttributeValueMapComponent;
  @Input() attribute: Attribute;
  @Input() readonly = false;
  @Output() sendEventToParent2 = new EventEmitter();

  updateMapAttribute(): void {
    if (this.attribute.type === 'java.util.LinkedHashMap') {
      this.mapComponent.updateAttribute();
    }
  }

  _sendEventToParent2(): void {
    this.sendEventToParent2.emit();
  }
}
