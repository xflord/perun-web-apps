import { Component, Input } from '@angular/core';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-attribute-unique-checkbox',
  templateUrl: './attribute-unique-checkbox.component.html',
  styleUrls: ['./attribute-unique-checkbox.component.scss'],
})
export class AttributeUniqueCheckboxComponent {
  @Input() attDef: AttributeDefinition;
}
