import { Pipe, PipeTransform } from '@angular/core';
import { PerunTranslateService } from '@perun-web-apps/perun/services';

@Pipe({
  name: 'applicationColumnSelectLabel',
})
export class ApplicationColumnSelectLabelPipe implements PipeTransform {
  constructor(private translate: PerunTranslateService) {}

  transform(value: string): string {
    switch (value) {
      case 'createdAt':
        return this.translate.instant('APPLICATIONS_LIST.CREATED_DATE');
      case 'createdBy':
        return this.translate.instant('APPLICATIONS_LIST.CREATED_BY');
      case 'type':
        return this.translate.instant('APPLICATIONS_LIST.TYPE');
      case 'state':
        return this.translate.instant('APPLICATIONS_LIST.STATE');
      case 'modifiedBy':
        return this.translate.instant('APPLICATIONS_LIST.MODIFIED_BY');
      default:
        return value;
    }
  }
}
