import { Pipe, PipeTransform } from '@angular/core';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { PerunBean } from '@perun-web-apps/perun/openapi';
import { AuthPrivilege } from '@perun-web-apps/perun/models';

@Pipe({
  name: 'manageableEntities',
})
export class ManageableEntitiesPipe implements PipeTransform {
  constructor(private authResolver: GuiAuthResolver) {}

  transform(entities: PerunBean[], role: string): PerunBean[] {
    return entities.filter((e) => this.canSetRoleForEntity(e, role));
  }

  private canSetRoleForEntity(entity: PerunBean, role: string): boolean {
    const manageRights = new Map<string, AuthPrivilege>();
    this.authResolver.setRolesAuthorization([role], entity, manageRights);

    return manageRights.get(role).manageAuth;
  }
}
