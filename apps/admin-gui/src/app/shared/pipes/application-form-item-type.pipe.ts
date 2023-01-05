import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Type } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'applicationFormItemType',
})
export class ApplicationFormItemTypePipe implements PipeTransform {
  private returnData = '';

  constructor(private translateService: TranslateService) {}

  transform(value: Type): string {
    this.translateService
      .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.' + value)
      .subscribe((text: string) => {
        this.returnData = text;
      });
    return this.returnData;
  }
}
