import { Pipe, PipeTransform } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';
import { isGroupSynchronized } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'disableGroupSelect',
})
export class DisableGroupSelectPipe implements PipeTransform {
  transform(
    group: Group,
    disableMemberGroup: boolean,
    disableGroup: boolean,
    disableSet: Set<number>,
  ): boolean {
    return (
      (disableMemberGroup && group.name === 'members') ||
      (disableGroup && (disableSet.has(group.id) || isGroupSynchronized(group)))
    );
  }
}
