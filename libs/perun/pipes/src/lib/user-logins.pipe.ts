import { Pipe, PipeTransform } from '@angular/core';
import { parseUserLogins } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'userLogins'
})
export class UserLoginsPipe implements PipeTransform {

  transform(value: any): any {
    return parseUserLogins(value);
  }

}
