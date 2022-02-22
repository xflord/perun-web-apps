import { Pipe, PipeTransform } from '@angular/core';
import { parseOrganization } from '@perun-web-apps/perun/utils';
import { RichMember } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'memberOrganization',
})
export class MemberOrganizationPipe implements PipeTransform {
  transform(value: RichMember): string {
    return parseOrganization(value);
  }
}
