import { Pipe, PipeTransform } from '@angular/core';
import { parseEmail } from '@perun-web-apps/perun/utils';
import { RichMember } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'memberEmail',
})
export class MemberEmailPipe implements PipeTransform {
  transform(value: RichMember): string {
    return parseEmail(value);
  }
}
