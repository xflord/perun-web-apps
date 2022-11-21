import { Pipe, PipeTransform } from '@angular/core';
import { Application, Group, Member } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'selectApplicationLink',
})
export class SelectApplicationLinkPipe implements PipeTransform {
  /**
   * Select the appropriate url for the given application (for Vo, Group or Member)
   *
   * @param application the given application
   * @param disableRouting returns null if routing is disabled
   * @param group group if it os a group application
   * @param member member if it should be a link for a member application
   */
  transform(
    application: Application,
    disableRouting: boolean,
    group: Group,
    member: Member
  ): string[] {
    if (disableRouting) return null;
    if (group) {
      return [
        '/organizations',
        String(application.vo.id),
        'groups',
        String(group.id),
        'applications',
        String(application.id),
      ];
    } else if (member) {
      return [
        '/organizations',
        String(application.vo.id),
        'members',
        String(member.id),
        'applications',
        String(application.id),
      ];
    } else {
      return ['/organizations', String(application.vo.id), 'applications', String(application.id)];
    }
  }
}
