import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupRoleType',
})
export class GroupRoleTypePipe implements PipeTransform {
  transform(value: string): string {
    let type = value.replace('INDIRECT', 'Derived');
    type = type.replace('DIRECT', 'Explicit');
    return type;
  }
}
