import { Pipe, PipeTransform } from '@angular/core';
import { parseEmail } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'memberEmail'
})
export class MemberEmailPipe implements PipeTransform {

  transform(value: any): any {
    return parseEmail(value);
  }

}
