import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RichMember } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'memberCheckboxLabel',
})
export class MemberCheckboxLabelPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: RichMember): string {
    if (value.membershipType === 'INDIRECT') {
      return this.translate.instant('MEMBERS_LIST.CHECKBOX_TOOLTIP_INDIRECT') as string;
    }
    const attr = value.memberAttributes.find((obj) => obj.friendlyName === 'isLifecycleAlterable');
    if (attr) {
      return attr.value
        ? ''
        : (this.translate.instant('MEMBERS_LIST.CHECKBOX_TOOLTIP_UNALTERABLE') as string);
    }
    return '';
  }
}
