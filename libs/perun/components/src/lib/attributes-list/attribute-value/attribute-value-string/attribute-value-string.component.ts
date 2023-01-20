import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, isVirtualAttribute } from '@perun-web-apps/perun/utils';
import {
  AttributeValueListEditDialogComponent,
  ShowValueDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';
import { PerunTranslateService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-attribute-value-string',
  templateUrl: './attribute-value-string.component.html',
  styleUrls: ['./attribute-value-string.component.scss'],
})
export class AttributeValueStringComponent implements OnInit {
  @Input() attribute: Attribute;
  @Input() readonly = false;
  @Output() sendEventToParent = new EventEmitter();

  value: string;
  multiline = false;

  constructor(private dialog: MatDialog, private translate: PerunTranslateService) {}

  ngOnInit(): void {
    this.value = this.attribute.value as string;
    if (!this.readonly) {
      this.readonly = isVirtualAttribute(this.attribute);
    }
    this.checkMultilineValue();
  }

  _sendEventToParent(): void {
    this.attribute.value = this.value;
    this.sendEventToParent.emit();
  }

  checkMultilineValue(): void {
    this.multiline = false;
    if (this.attribute.value && (this.attribute.value as string).includes('\n')) {
      this.multiline = true;
      const values = (this.attribute.value as string).split('\n');
      this.value =
        `${values[0]} ... (${values.length - 1} ` +
        (values.length > 2
          ? this.translate.instant(
              'SHARED_LIB.PERUN.COMPONENTS.ATTRIBUTE_VALUE_STRING.EXTRA_LINES_PLURAL'
            )
          : this.translate.instant(
              'SHARED_LIB.PERUN.COMPONENTS.ATTRIBUTE_VALUE_STRING.EXTRA_LINES_SINGLE'
            )) +
        ')';
    }
  }

  showValue(value: string, title: string): void {
    const config = getDefaultDialogConfig();
    config.width = '350px';
    config.data = {
      value: value,
      title: title,
    };
    this.dialog.open(ShowValueDialogComponent, config);
  }

  edit(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = { attribute: this.attribute };

    const dialogRef = this.dialog.open(AttributeValueListEditDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.value = this.attribute.value as string;
        this.checkMultilineValue();
        this.sendEventToParent.emit();
      }
    });
  }
}
