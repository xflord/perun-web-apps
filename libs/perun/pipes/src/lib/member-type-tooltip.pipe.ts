import { Pipe, PipeTransform } from '@angular/core';
import { PerunTranslateService } from '@perun-web-apps/perun/services';

@Pipe({
  name: 'memberTypeTooltip',
})
export class MemberTypeTooltipPipe implements PipeTransform {
  constructor(private translate: PerunTranslateService) {}

  transform(value: string): string {
    const tooltip =
      value === 'DIRECT' ? 'MEMBERS_LIST.DIRECT_MEMBER' : 'MEMBERS_LIST.INDIRECT_MEMBER';
    return this.translate.instant(tooltip);
  }
}
