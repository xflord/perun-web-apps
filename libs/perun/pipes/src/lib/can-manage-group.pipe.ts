import { Pipe, PipeTransform } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Pipe({
  name: 'canManageGroup',
})
export class CanManageGroupPipe implements PipeTransform {
  constructor(private authResolver: GuiAuthResolver) {}

  transform(group: Group): boolean {
    return (
      this.authResolver.isThisGroupAdmin(group.id) || this.authResolver.isThisVoAdmin(group.voId)
    );
  }
}
