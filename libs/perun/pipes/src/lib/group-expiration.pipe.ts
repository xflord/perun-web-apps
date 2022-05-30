import { Pipe, PipeTransform } from '@angular/core';
import { RichGroup } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'groupExpiration',
})
export class GroupExpirationPipe implements PipeTransform {
  transform(group: RichGroup): string {
    const attribute = group.attributes.find(
      (att) => att.baseFriendlyName === 'groupMembershipExpiration'
    );
    return (attribute?.value as string) ?? 'Never';
  }
}
