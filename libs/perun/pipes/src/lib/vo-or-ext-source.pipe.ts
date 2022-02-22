import { Pipe, PipeTransform } from '@angular/core';
import { parseVo } from '@perun-web-apps/perun/utils';
import { RichUser } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'userVo',
})
export class UserVoPipe implements PipeTransform {
  transform(value: RichUser): string {
    return parseVo(value);
  }
}
