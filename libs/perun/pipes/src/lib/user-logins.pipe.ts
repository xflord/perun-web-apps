import { Pipe, PipeTransform } from '@angular/core';
import { parseUserLogins } from '@perun-web-apps/perun/utils';
import { RichUser } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'userLogins',
})
export class UserLoginsPipe implements PipeTransform {
  transform(value: RichUser): string {
    return parseUserLogins(value);
  }
}
