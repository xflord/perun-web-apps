import { Pipe, PipeTransform } from '@angular/core';
import { parseLogins } from '@perun-web-apps/perun/utils';
import { RichMember } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'memberLogins',
})
export class MemberLoginsPipe implements PipeTransform {
  transform(value: RichMember): string {
    return parseLogins(value);
  }
}
