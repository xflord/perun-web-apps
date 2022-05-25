import { Pipe, PipeTransform } from '@angular/core';
import { RichGroup } from '@perun-web-apps/perun/openapi';
import { hasBooleanAttributeEnabled, isGroupSynchronized } from '@perun-web-apps/perun/utils';
import { Urns } from '@perun-web-apps/perun/urns';

@Pipe({
  name: 'groupMembersActionButtonDisabled',
})
export class GroupMembersActionButtonDisabledPipe implements PipeTransform {
  transform(group: RichGroup, button?: string): boolean {
    if (group.name === 'members') {
      return true;
    } else if (isGroupSynchronized(group)) {
      return true;
    } else if (button === 'add') {
      if (hasBooleanAttributeEnabled(group.attributes, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING)) {
        return true;
      }
    }
    return false;
  }
}
