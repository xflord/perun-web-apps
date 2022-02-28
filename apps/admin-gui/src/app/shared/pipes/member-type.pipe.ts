import { Pipe, PipeTransform } from '@angular/core';
import { MemberCandidate } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'memberType',
})
export class MemberTypePipe implements PipeTransform {
  transform(memberCandidate: MemberCandidate, type: string): string {
    if (type === 'vo') {
      if (memberCandidate.member != null) return 'Member of VO';
    } else {
      if (
        memberCandidate.member != null &&
        memberCandidate.member.sourceGroupId !== 0 &&
        memberCandidate.member.membershipType === 'DIRECT'
      )
        return 'Member of Group';
      if (
        memberCandidate.member != null &&
        memberCandidate.member.sourceGroupId !== 0 &&
        memberCandidate.member.membershipType === 'INDIRECT'
      )
        return 'Indirect member of Group';
      if (memberCandidate.member != null) return 'Member of VO';
    }
    return '';
  }
}
