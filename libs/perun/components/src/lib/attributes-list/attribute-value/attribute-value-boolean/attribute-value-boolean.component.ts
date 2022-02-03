import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';
import { isVirtualAttribute } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-attribute-value-boolean',
  templateUrl: './attribute-value-boolean.component.html',
  styleUrls: ['./attribute-value-boolean.component.scss'],
})
export class AttributeValueBooleanComponent implements OnInit {
  constructor() {}

  @Input()
  attribute: Attribute;

  @Input()
  readonly = false;

  @Output() sendEventToParent = new EventEmitter();

  ngOnInit() {
    if (!this.readonly) {
      this.readonly = isVirtualAttribute(this.attribute);
    }
  }

  _sendEventToParent() {
    this.sendEventToParent.emit();
  }
}
