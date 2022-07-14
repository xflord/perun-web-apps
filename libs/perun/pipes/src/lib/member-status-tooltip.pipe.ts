import { Pipe, PipeTransform } from '@angular/core';
import { Attribute, RichMember } from '@perun-web-apps/perun/openapi';
import { isMemberIndirectString, parseMemberStatus } from '@perun-web-apps/perun/utils';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'memberStatusTooltip',
})
export class MemberStatusTooltipPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(member: RichMember, showGroupStatuses: boolean, membersGroup?: boolean): string {
    let memberExpiration: Attribute = null;
    let groupExpiration: Attribute = null;

    if (member.memberAttributes) {
      memberExpiration = member.memberAttributes.find(
        (att) => att.friendlyName === 'membershipExpiration'
      );
      groupExpiration = member.memberAttributes.find(
        (att) => att.friendlyName === 'groupMembershipExpiration'
      );
    }

    let res = '';
    if (showGroupStatuses) {
      res = `\n Group status: ${parseMemberStatus(member.groupStatus)}
      Expiration: ${(groupExpiration?.value as string) ?? 'never'}`;
    } else {
      if (member.memberAttributes) {
        res = `Status: ${parseMemberStatus(member.status, member.groupStatus)}
             Vo status: ${parseMemberStatus(member.status)}
             Expiration: ${(memberExpiration?.value as string) ?? 'never'}`;
      } else {
        // we can't display correct expiration without attributes, but we can still display statuses
        res = `Status: ${parseMemberStatus(member.status, member.groupStatus)}
            Vo status: ${parseMemberStatus(member.status)}`;
      }
    }

    const indirect = isMemberIndirectString(member);
    if (membersGroup) {
      res = `${res}
      ${this.translate.instant('MEMBERS_LIST.STATUS_TOOLTIP_MEMBERS_GROUP') as string}`;
    } else if (indirect === 'INDIRECT' && showGroupStatuses) {
      res = `${res}
      ${this.translate.instant('MEMBERS_LIST.STATUS_TOOLTIP_GROUP_INDIRECT') as string}`;
    } else if (!showGroupStatuses && indirect === 'UNALTERABLE') {
      res = `${res}
      ${this.translate.instant('MEMBERS_LIST.STATUS_TOOLTIP_INDIRECT') as string}`;
    }
    return res;
  }
}
