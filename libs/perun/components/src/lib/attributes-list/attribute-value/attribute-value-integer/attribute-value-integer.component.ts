import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, isVirtualAttribute } from '@perun-web-apps/perun/utils';
import { ShowValueDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-attribute-value-integer',
  templateUrl: './attribute-value-integer.component.html',
  styleUrls: ['./attribute-value-integer.component.css'],
})
export class AttributeValueIntegerComponent implements OnInit {
  @Input() attribute: Attribute;
  @Input() readonly = false;
  @Output() sendEventToParent = new EventEmitter();
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    if (!this.readonly) {
      this.readonly = isVirtualAttribute(this.attribute);
    }
  }

  _sendEventToParent(): void {
    this.sendEventToParent.emit();
  }

  showValue(attribute: Attribute): void {
    const config = getDefaultDialogConfig();
    config.width = '350px';
    config.data = {
      value: attribute.value as string,
      title: attribute.displayName,
    };
    this.dialog.open(ShowValueDialogComponent, config);
  }
}
