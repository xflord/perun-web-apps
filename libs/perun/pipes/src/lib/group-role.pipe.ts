import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupRole',
})
export class GroupRolePipe implements PipeTransform {
  transform(value: string): string {
    let role = value.replace('GROUPADMIN', 'Admin');
    role = role.replace('GROUPOBSERVER', 'Observer');
    role = role.replace('GROUPMEMBERSHIPMANAGER', 'Membership manager');
    return role;
  }
}
