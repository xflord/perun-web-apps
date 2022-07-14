import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupStatusIconColor' })
export class GroupStatusIconColorPipe implements PipeTransform {
  transform(status: string, membershipType: boolean, isMembersGroup?: boolean): string {
    let color: string;
    switch (status) {
      case 'VALID':
        color = 'green';
        break;
      case 'INVALID':
        color = 'red';
        break;
      default:
        color = '';
    }
    return `${color}${isMembersGroup || membershipType ? ' cursor-default' : ''}`;
  }
}
