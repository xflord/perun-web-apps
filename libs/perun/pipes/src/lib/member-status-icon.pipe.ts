import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memberStatusIcon',
})
export class MemberStatusIconPipe implements PipeTransform {
  /**
   * Return string representing Material icon for status of given member.
   *
   * @param value string status
   * @param args not used
   */
  transform(value: string): string {
    switch (value) {
      case 'VALID':
        return 'verified_user';
      case 'INVALID':
        return 'report';
      case 'EXPIRED':
        return 'schedule';
      case 'DISABLED':
        return 'delete';
      default:
        return value;
    }
  }
}
