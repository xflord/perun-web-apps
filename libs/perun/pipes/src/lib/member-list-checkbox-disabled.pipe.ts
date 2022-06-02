import { Pipe, PipeTransform } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'memberListCheckboxDisabled',
})
export class MemberListCheckboxDisabledPipe implements PipeTransform {
  transform(value: RichMember): boolean {
    if (value.membershipType === 'INDIRECT') {
      return true;
    }
    const attr = value.memberAttributes.find((obj) => obj.friendlyName === 'isLifecycleAlterable');
    if (attr) {
      return !attr.value;
    }
    return false;
  }
}
