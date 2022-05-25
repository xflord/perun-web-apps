import { Pipe, PipeTransform } from '@angular/core';
import { RichGroup } from '@perun-web-apps/perun/openapi';
import { hasBooleanAttributeEnabled, isGroupSynchronized } from '@perun-web-apps/perun/utils';
import { Urns } from '@perun-web-apps/perun/urns';

@Pipe({
  name: 'groupMembersActionButtonDisabledTooltip',
})
export class GroupMembersActionButtonDisabledTooltipPipe implements PipeTransform {
  transform(group: RichGroup, button?: 'add'): string {
    if (group.name === 'members') {
      return 'GROUP_DETAIL.MEMBERS.BUTTON_DISABLED_MEMBERS_GROUP';
    } else if (isGroupSynchronized(group)) {
      return 'GROUP_DETAIL.MEMBERS.SYNCHRONIZED';
    } else if (button === 'add') {
      if (hasBooleanAttributeEnabled(group.attributes, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING)) {
        return 'GROUP_DETAIL.MEMBERS.ADD_MEMBER_DISABLED';
      }
    }
    return '';
  }
}
