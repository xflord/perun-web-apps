import { Pipe, PipeTransform } from '@angular/core';
import { parseOrganization } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'memberOrganization',
})
export class MemberOrganizationPipe implements PipeTransform {
  transform(value: any): unknown {
    return parseOrganization(value);
  }
}
