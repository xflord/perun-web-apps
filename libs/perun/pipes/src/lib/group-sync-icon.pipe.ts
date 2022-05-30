import { Pipe, PipeTransform } from '@angular/core';
import { RichGroup } from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { getAttribute } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'groupSyncIcon',
})
export class GroupSyncIconPipe implements PipeTransform {
  transform(richGroup: RichGroup): unknown {
    if (
      richGroup === undefined ||
      richGroup === null ||
      richGroup.attributes === undefined ||
      richGroup.attributes === null
    ) {
      return '';
    }
    const normalSyncEnabled = getAttribute(richGroup.attributes, Urns.GROUP_SYNC_ENABLED);
    const structureSyncEnabled = getAttribute(
      richGroup.attributes,
      Urns.GROUP_STRUCTURE_SYNC_ENABLED
    );
    if (normalSyncEnabled === null && structureSyncEnabled === null) {
      return '';
    }
    const structureSyncEnabledValue = structureSyncEnabled.value as boolean;
    const normalSyncEnabledValue = normalSyncEnabled.value as string;

    if (normalSyncEnabledValue === 'true') {
      const syncLastStatus = getAttribute(richGroup.attributes, Urns.GROUP_LAST_SYNC_STATE);
      const syncLastTime = getAttribute(richGroup.attributes, Urns.GROUP_LAST_SYNC_TIMESTAMP);
      const lastStatusValue = syncLastStatus.value as string;
      const lastTimeValue = syncLastTime.value as string;
      if (lastStatusValue != null && lastStatusValue.trim().length > 0) {
        return 'sync_problem';
      } else {
        if (lastTimeValue !== null && lastTimeValue.trim().length > 0) {
          return 'sync';
        }
        return 'sync';
      }
    }

    if (structureSyncEnabledValue) {
      const syncLastStatus = getAttribute(
        richGroup.attributes,
        Urns.GROUP_LAST_STRUCTURE_SYNC_STATE
      );
      const syncLastTime = getAttribute(
        richGroup.attributes,
        Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP
      );
      const lastStatusValue = syncLastStatus.value as string;
      const lastTimeValue = syncLastTime.value as string;
      if (lastStatusValue != null && lastStatusValue.trim().length > 0) {
        return 'sync_problem';
      } else {
        if (lastTimeValue !== null && lastTimeValue.trim().length > 0) {
          return 'sync';
        }
        return 'sync';
      }
    }
    return 'sync_disabled';
  }
}
