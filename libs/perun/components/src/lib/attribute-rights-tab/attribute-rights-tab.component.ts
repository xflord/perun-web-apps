import { Component, Input, OnChanges } from '@angular/core';
import { AttributeAction, AttributePolicyCollection } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-attribute-rights-tab',
  templateUrl: './attribute-rights-tab.component.html',
  styleUrls: ['./attribute-rights-tab.component.scss'],
})
export class AttributeRightsTabComponent implements OnChanges {
  @Input() attributeId: number | null;
  @Input() collections: AttributePolicyCollection[];
  @Input() action: AttributeAction;
  lastIndex: number;

  ngOnChanges(): void {
    this.lastIndex = this.findLastIndex();
  }

  addCollection(): void {
    this.collections.push({
      id: -1,
      attributeId: this.attributeId,
      action: this.action,
      policies: [{ id: -1, role: null, object: null, policyCollectionId: -1 }],
    });
    this.lastIndex = this.findLastIndex();
  }

  removeCollection(index: number): void {
    this.collections.splice(index, 1);
    this.lastIndex = this.findLastIndex();
  }

  findLastIndex(): number {
    let lastIdx = 0;
    for (let i = 0; i < this.collections.length; i++) {
      if (this.collections[i].action === this.action) {
        lastIdx = i;
      }
    }
    return lastIdx;
  }
}
