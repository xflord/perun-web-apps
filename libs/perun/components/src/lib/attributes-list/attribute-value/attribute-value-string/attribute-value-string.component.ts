import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, isVirtualAttribute } from '@perun-web-apps/perun/utils';
import { ShowValueDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-attribute-value-string',
  templateUrl: './attribute-value-string.component.html',
  styleUrls: ['./attribute-value-string.component.scss'],
})
export class AttributeValueStringComponent implements OnInit {
  constructor(private dialog: MatDialog) {}

  @Input()
  attribute: Attribute;

  @Input()
  readonly = false;

  @Output() sendEventToParent = new EventEmitter();

  value: string;

  ngOnInit() {
    this.value = <string>(<unknown>this.attribute.value);
    if (!this.readonly) {
      this.readonly = isVirtualAttribute(this.attribute);
    }
  }

  _sendEventToParent() {
    this.sendEventToParent.emit();
  }

  showValue(value: string, title: string) {
    const config = getDefaultDialogConfig();
    config.width = '350px';
    config.data = {
      value: value,
      title: title,
    };
    this.dialog.open(ShowValueDialogComponent, config);
  }
}
