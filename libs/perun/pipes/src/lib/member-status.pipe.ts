import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memberStatus',
})
export class MemberStatusPipe implements PipeTransform {
  /**
   * @param value member status in organization/group, or string in form 'STATUS (+n others)' or 'ALL'
   */
  transform(value: string): string {
    // Need replace since value can be not just raw status
    let status = value.replace('VALID', 'ACTIVE');
    // INVALID was changed to INACTIVE by first replace
    status = status.replace('INACTIVE', 'INCOMPLETE');
    return status;
  }
}
