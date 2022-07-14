import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { isMemberIndirectString } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'memberCheckboxLabel',
})
export class MemberCheckboxLabelPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: RichMember, groupId?: boolean): string {
    const indirect = isMemberIndirectString(value);
    if (indirect === 'INDIRECT') {
      return this.translate.instant('MEMBERS_LIST.CHECKBOX_TOOLTIP_INDIRECT') as string;
    }
    if (!groupId && indirect === 'UNALTERABLE') {
      return this.translate.instant('MEMBERS_LIST.CHECKBOX_TOOLTIP_UNALTERABLE') as string;
    }
    return '';
  }
}
