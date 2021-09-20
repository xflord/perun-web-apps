import {Pipe, PipeTransform} from '@angular/core';
import { parseUserEmail } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'userEmail'
})
export class UserEmailPipe implements PipeTransform {

  transform(value: any): any {
    return parseUserEmail(value);
  }
}
