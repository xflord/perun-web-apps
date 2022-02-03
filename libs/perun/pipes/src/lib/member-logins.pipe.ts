import { Pipe, PipeTransform } from '@angular/core';
import { parseLogins } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'memberLogins',
})
export class MemberLoginsPipe implements PipeTransform {
  transform(value: any): any {
    return parseLogins(value);
  }
}
