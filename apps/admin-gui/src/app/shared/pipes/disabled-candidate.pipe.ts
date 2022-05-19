import { Pipe, PipeTransform } from '@angular/core';
import { MemberCandidate } from '@perun-web-apps/perun/openapi';
import { AddMemberService } from '../../vos/components/add-member.service';

@Pipe({
  name: 'disabledCandidate',
})
export class DisabledCandidatePipe implements PipeTransform {
  constructor(private addMemberService: AddMemberService) {}

  transform(value: MemberCandidate, addingBlocked: boolean): boolean {
    if (value.member) {
      if (this.addMemberService.getType() === 'vo') {
        // Is member of organization, when target is organization
        return true;
      } else {
        // Is DIRECT member of group, when target is group
        return value.member?.sourceGroupId && value.member?.membershipType === 'DIRECT';
      }
    }

    // Manual adding is blocked
    return addingBlocked;
  }
}
