import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoleManagementRules } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-role-search-select',
  templateUrl: './role-search-select.component.html',
  styleUrls: ['./role-search-select.component.scss'],
})
export class RoleSearchSelectComponent {
  @Input() role: RoleManagementRules = null;
  @Input() roles: RoleManagementRules[];
  @Input() disableAutoSelect = false;
  @Output() roleSelected = new EventEmitter<RoleManagementRules>();

  nameFunction = (rule: RoleManagementRules): string => rule.displayName;
  secondaryTextFunction = (): string => null;
}
