import { Pipe, PipeTransform } from '@angular/core';
import { MemberCandidate } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'disabledCandidateTooltip',
})
export class DisabledCandidateTooltipPipe implements PipeTransform {
  transform(value: MemberCandidate): string {
    return value.member
      ? 'MEMBERS_CANDIDATES_LIST.ALREADY_MEMBER'
      : 'MEMBERS_CANDIDATES_LIST.ADDING_BLOCKED';
  }
}
