import { Pipe, PipeTransform } from '@angular/core';
import { User } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'userFullName'
})
export class UserFullNamePipe implements PipeTransform {

  transform(value: any): any {
    const user = <User> value;

    let fullName = '';

    if (user.titleBefore !== null) {
      fullName += user.titleBefore + ' ';
    }
    if (user.firstName !== null) {
      fullName += user.firstName + ' ';
    }
    if (user.middleName !== null) {
      fullName += user.middleName + ' ';
    }
    if (user.lastName !== null) {
      fullName += user.lastName + ' ';
    }
    if (user.titleAfter !== null) {
      fullName += user.titleAfter + ' ';
    }
    if (fullName.endsWith(' ')) {
      fullName = fullName.substring(0, fullName.length - 1);
    }

    return fullName;
  }

}
