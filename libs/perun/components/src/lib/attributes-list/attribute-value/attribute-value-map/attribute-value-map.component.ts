import { Component, Input, OnInit } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { ShowValueDialogComponent } from '@perun-web-apps/perun/dialogs';
import { getDefaultDialogConfig, isVirtualAttribute } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-attribute-value-map',
  templateUrl: './attribute-value-map.component.html',
  styleUrls: ['./attribute-value-map.component.scss'],
})
export class AttributeValueMapComponent implements OnInit {
  @Input() attribute: Attribute;
  @Input() readonly = false;

  keys: string[] = [];
  values: string[] = [];

  defaultItemsShown = 3;
  itemsShown: number;
  showMore = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.attribute.value) {
      const map = new Map<string, string>(
        Object.entries(this.attribute.value as { [s: string]: string })
      );
      for (const [key, value] of map.entries()) {
        this.keys.push(key);
        this.values.push(value);
      }
    }
    this.itemsShown = this.readonly ? this.values.length : this.defaultItemsShown;
    this.showMore = this.readonly;
    if (!this.readonly) {
      this.readonly = isVirtualAttribute(this.attribute);
    }
  }

  customTrackBy(index: number): number {
    return index;
  }

  addValue(): void {
    this.keys.push('');
    this.values.push('');

    if (this.values.length > this.defaultItemsShown) {
      this.showMore = true;
      this.setItemsShown();
    }
  }

  removeValue(index: number): void {
    this.keys.splice(index, 1);
    this.values.splice(index, 1);
  }

  updateAttribute(): void {
    const map = {};
    for (let i = 0; i < this.keys.length; i++) {
      map[this.keys[i]] = this.values[i];
    }
    if (this.keys.length === 0) {
      this.attribute.value = undefined;
    } else {
      this.attribute.value = map;
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

  onShowChange(): void {
    this.showMore = !this.showMore;

    this.setItemsShown();
  }

  private setItemsShown(): void {
    if (this.showMore) {
      this.itemsShown = this.values.length;
    } else {
      this.itemsShown = this.defaultItemsShown;
    }
  }
}
