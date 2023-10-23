import { Pipe, PipeTransform } from '@angular/core';
import { PerunBean, RoleManagementRules } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'unassignedRole',
})
export class UnassignedRolePipe implements PipeTransform {
  /**
   * Filters out already assigned entities.
   *
   * @param entities list of all entities
   * @param roles currently assigned roles
   * @param role selected role
   */
  transform(
    entities: PerunBean[],
    roles: Map<string, Map<string, Array<number>>>,
    role: RoleManagementRules,
  ): PerunBean[] {
    return entities.filter(
      (e) => !roles.get(role.roleName)?.get(role.primaryObject)?.includes(e.id),
    );
  }
}
