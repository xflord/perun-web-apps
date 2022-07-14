import { Pipe, PipeTransform } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { isMemberIndirectString } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'memberStatusDisabled',
})
export class MemberStatusDisabledPipe implements PipeTransform {
  transform(member: RichMember, groupId?: number): boolean {
    const indirect = isMemberIndirectString(member);
    // disable checkbox, if member is indirect or group is selected and member is unalterable
    return indirect === 'INDIRECT' || (!groupId && indirect === 'UNALTERABLE');
  }
}
