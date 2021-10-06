import { Pipe, PipeTransform } from '@angular/core';
import { parseVo } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'userVo'
})
export class UserVoPipe implements PipeTransform {

  transform(value: any): any {
    return parseVo(value);
  }

}
