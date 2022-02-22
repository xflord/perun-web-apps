import { Pipe, PipeTransform } from '@angular/core';
import { parseUserEmail } from '@perun-web-apps/perun/utils';
import { RichUser } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'userEmail',
})
export class UserEmailPipe implements PipeTransform {
  transform(value: RichUser): string {
    return parseUserEmail(value);
  }
}
