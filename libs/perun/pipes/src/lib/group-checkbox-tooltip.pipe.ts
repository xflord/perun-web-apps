import { Pipe, PipeTransform } from '@angular/core';
import { GroupWithStatus } from '@perun-web-apps/perun/models';
import { isGroupSynchronized } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'groupCheckboxTooltip',
})
export class GroupCheckboxTooltipPipe implements PipeTransform {
  transform(group: GroupWithStatus, relation: boolean): string {
    if (relation) {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.CREATE_RELATION_AUTH_TOOLTIP';
    } else if (isGroupSynchronized(group)) {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.SYNCHRONIZED_GROUP';
    } else if (group.sourceGroupId) {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.INDIRECT_GROUP';
    } else if (group.name === 'members') {
      return '';
    } else {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.ALREADY_MEMBER_TOOLTIP';
    }
  }
}
