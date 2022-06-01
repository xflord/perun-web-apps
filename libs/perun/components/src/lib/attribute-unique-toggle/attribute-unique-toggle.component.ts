import { Component, Input } from '@angular/core';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-attribute-unique-toggle',
  templateUrl: './attribute-unique-toggle.component.html',
  styleUrls: ['./attribute-unique-toggle.component.scss'],
})
export class AttributeUniqueToggleComponent {
  @Input() attDef: AttributeDefinition;
}
