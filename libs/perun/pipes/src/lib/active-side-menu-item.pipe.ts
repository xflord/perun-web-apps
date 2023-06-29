import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activeSideMenuItem',
})
export class ActiveSideMenuItemPipe implements PipeTransform {
  transform(currentUrl: string, regexValue: string): boolean {
    const regexp = new RegExp(regexValue);
    return regexp.test(currentUrl.split('?')[0]);
  }
}
