import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'memberStatusIconColor'
})
export class MemberStatusIconColorPipe implements PipeTransform {

  /**
   * Return color which should be used for icon of given member's status.
   *
   */
  transform(value: any): any {
    switch (value) {
      case 'VALID':
        return 'green';
      case 'INVALID':
        return 'red';
      default:
        return '';
    }
  }
}
