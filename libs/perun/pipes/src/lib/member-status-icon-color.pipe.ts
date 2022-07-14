import { Pipe, PipeTransform } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { isMemberIndirectString } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'memberStatusIconColor',
})
export class MemberStatusIconColorPipe implements PipeTransform {
  /**
   * Return color which should be used for icon of given member's status.
   *
   */
  transform(member: RichMember): string {
    const indirect = isMemberIndirectString(member);

    let color: string;

    const status = member.status;
    switch (status) {
      case 'VALID':
        color = 'green';
        break;
      case 'INVALID':
        color = 'red';
        break;
      case 'DISABLED':
        color = 'black';
        break;
      default:
        return ``;
    }

    return `${color}${indirect === 'UNALTERABLE' ? ' cursor-default' : ''}`;
  }
}
