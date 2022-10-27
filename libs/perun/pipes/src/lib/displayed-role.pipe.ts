import { Pipe, PipeTransform } from '@angular/core';
import { RoleManagementRules } from '@perun-web-apps/perun/openapi';
import { PerunTranslateService } from '@perun-web-apps/perun/services';

@Pipe({
  name: 'displayedRole',
})
export class DisplayedRolePipe implements PipeTransform {
  prefix = 'ROLES.';

  constructor(private translate: PerunTranslateService) {}

  transform(value: RoleManagementRules): string {
    // Show display name if present
    if ('displayName' in value && value.displayName) {
      return value.displayName;
    }

    return this.translate.instant(this.prefix + value.roleName);
  }
}
