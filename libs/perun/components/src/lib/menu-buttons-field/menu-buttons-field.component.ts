import { Component, Input } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'perun-web-apps-menu-buttons-field',
  templateUrl: './menu-buttons-field.component.html',
  styleUrls: ['./menu-buttons-field.component.scss'],
})
export class MenuButtonsFieldComponent {
  @Input() items: MenuItem[];
}
