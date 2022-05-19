import { Pipe, PipeTransform } from '@angular/core';
import { MemberCandidate } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'memberType',
})
export class MemberTypePipe implements PipeTransform {
  transform(memberCandidate: MemberCandidate): string {
    if (
      memberCandidate?.member?.sourceGroupId &&
      memberCandidate?.member?.membershipType === 'DIRECT'
    ) {
      return 'Member of Group';
    } else if (
      memberCandidate?.member?.sourceGroupId &&
      memberCandidate?.member?.membershipType === 'INDIRECT'
    ) {
      return 'Indirect member of Group';
    } else if (memberCandidate.member) {
      return 'Member of VO';
    } else {
      return '';
    }
  }
}
