import { Component, Input } from '@angular/core';
import {
  AttributeAction,
  AttributeDefinition,
  AttributePolicyCollection,
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-attribute-rights-tab-group',
  templateUrl: './attribute-rights-tab-group.component.html',
  styleUrls: ['./attribute-rights-tab-group.component.scss'],
})
export class AttributeRightsTabGroupComponent {
  @Input() attDef: AttributeDefinition;
  @Input() collections: AttributePolicyCollection[] = [];
  actionTabs: AttributeAction[] = ['READ', 'WRITE'];
}
