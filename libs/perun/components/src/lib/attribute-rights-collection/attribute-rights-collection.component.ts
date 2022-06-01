import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AttributePolicyCollection } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-attribute-rights-collection',
  templateUrl: './attribute-rights-collection.component.html',
  styleUrls: ['./attribute-rights-collection.component.scss'],
})
export class AttributeRightsCollectionComponent {
  @Input() collection: AttributePolicyCollection;
  @Output() collectionRemoved: EventEmitter<void> = new EventEmitter<void>();

  addPolicy(): void {
    this.collection.policies.push({
      id: -1,
      role: null,
      object: null,
      policyCollectionId: this.collection.id,
    });
  }

  removePolicy(index: number): void {
    this.collection.policies.splice(index, 1);
    if (this.collection.policies.length === 0) {
      this.removeCollection();
    }
  }

  removeCollection(): void {
    this.collectionRemoved.emit();
  }
}
