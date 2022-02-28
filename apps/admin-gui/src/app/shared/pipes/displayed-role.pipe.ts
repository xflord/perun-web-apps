import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'displayedRole',
})
export class DisplayedRolePipe implements PipeTransform {
  prefix = 'ROLES.';

  constructor(private translate: TranslateService) {}

  transform(value: string): string {
    const data = this.prefix.concat(value);
    return this.translate.instant(data) as string;
  }
}
