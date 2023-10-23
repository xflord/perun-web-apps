import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupsManagerService, RichGroup } from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { getAttribute } from '@perun-web-apps/perun/utils';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { formatDate } from '@angular/common';

export type SyncType = 'BASIC' | 'STRUCTURED';

export interface GroupSyncDetailDialogData {
  groupId: number;
  theme: string;
}

@Component({
  selector: 'perun-web-apps-group-sync-detail-dialog',
  templateUrl: './group-sync-detail-dialog.component.html',
  styleUrls: ['./group-sync-detail-dialog.component.scss'],
})
export class GroupSyncDetailDialogComponent implements OnInit {
  theme: string;
  loading = true;
  group: RichGroup;
  syncInterval = '';
  syncState = '';
  syncTime = '';
  syncType = '';
  type: SyncType;

  constructor(
    public dialogRef: MatDialogRef<GroupSyncDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GroupSyncDetailDialogData,
    private groupService: GroupsManagerService,
    private notificator: NotificatorService,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.loadGroup();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onForce(): void {
    this.loading = true;
    if (this.type === 'BASIC') {
      this.groupService.forceGroupSynchronization(this.group.id).subscribe({
        next: () => {
          this.notificator.showSuccess('DIALOGS.GROUP_SYNC_DETAIL.FORCE_SUCCESS');
          this.refresh();
        },
        error: () => (this.loading = false),
      });
    } else {
      this.groupService.forceGroupStructureSynchronization(this.group.id).subscribe({
        next: () => {
          this.notificator.showSuccess('DIALOGS.GROUP_SYNC_DETAIL.FORCE_SUCCESS');
          this.refresh();
        },
        error: () => (this.loading = false),
      });
    }
  }

  refresh(): void {
    this.loadGroup();
  }

  private loadGroup(): void {
    this.loading = true;
    this.groupService
      .getRichGroupByIdWithAttributesByNames(this.data.groupId, [
        Urns.GROUP_SYNC_ENABLED,
        Urns.GROUP_LAST_SYNC_STATE,
        Urns.GROUP_LAST_SYNC_TIMESTAMP,
        Urns.GROUP_STRUCTURE_SYNC_ENABLED,
        Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
        Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP,
        Urns.GROUP_SYNC_INTERVAL,
      ])
      .subscribe((richGroup) => {
        this.group = richGroup;

        const syncEnabled = getAttribute(this.group.attributes, Urns.GROUP_SYNC_ENABLED)
          .value as string;
        const lastSyncState = getAttribute(this.group.attributes, Urns.GROUP_LAST_SYNC_STATE)
          .value as string;
        const lastSyncTime = getAttribute(this.group.attributes, Urns.GROUP_LAST_SYNC_TIMESTAMP)
          .value as string;
        const structSyncEnabled = getAttribute(
          this.group.attributes,
          Urns.GROUP_STRUCTURE_SYNC_ENABLED,
        ).value as boolean;
        const lastStructSyncState = getAttribute(
          this.group.attributes,
          Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
        ).value as string;
        const lastStructSyncTime = getAttribute(
          this.group.attributes,
          Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP,
        ).value as string;
        const syncInterval = getAttribute(this.group.attributes, Urns.GROUP_SYNC_INTERVAL)
          .value as string;
        // value is in chunks of 5 minutes
        this.syncInterval = syncInterval === null ? 'N/A' : (+syncInterval * 5).toString();

        if (syncEnabled !== null && syncEnabled === 'true') {
          this.type = 'BASIC';
          this.syncType = 'DIALOGS.GROUP_SYNC_DETAIL.NORMAL_SYNC';
          this.syncState = lastSyncState !== '' ? lastSyncState : 'OK';
          this.syncTime = formatDate(lastSyncTime, 'YYYY-MM-dd H:mm:ss', 'en');
        }
        if (structSyncEnabled !== null && structSyncEnabled) {
          this.type = 'STRUCTURED';
          this.syncType = 'DIALOGS.GROUP_SYNC_DETAIL.STRUCT_SYNC';
          this.syncState = lastStructSyncState !== '' ? lastStructSyncState : 'OK';
          this.syncTime = formatDate(lastStructSyncTime, 'YYYY-MM-dd H:mm:ss', 'en');
        }
        this.loading = false;
      });
  }
}
