import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoleManagementRules } from '@perun-web-apps/perun/openapi';
import { DisplayedRolePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'perun-web-apps-role-search-select',
  templateUrl: './role-search-select.component.html',
  styleUrls: ['./role-search-select.component.scss'],
  providers: [DisplayedRolePipe],
})
export class RoleSearchSelectComponent {
  @Input() role: RoleManagementRules = null;
  @Input() roles: RoleManagementRules[];
  @Input() disableAutoSelect = false;
  @Output() roleSelected = new EventEmitter<RoleManagementRules>();

  constructor(private displayedRole: DisplayedRolePipe) {}

  nameFunction = (rule: RoleManagementRules): string => this.displayedRole.transform(rule.roleName);
  secondaryTextFunction = (): string => null;
}
