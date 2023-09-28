import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupRoleType',
})
export class GroupRoleTypePipe implements PipeTransform {
  transform(value: string): string {
    let type = value.replace('INDIRECT', 'Indirect');
    type = type.replace('DIRECT', 'Direct');
    return type;
  }
}
