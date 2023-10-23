import { Component, Inject, OnInit } from '@angular/core';
import { Group, GroupsManagerService, RichGroup, RichMember } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TABLE_VO_GROUPS } from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';
import { hasBooleanAttributeEnabled, isGroupSynchronized } from '@perun-web-apps/perun/utils';
import {
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';

export interface CopyMembersDialogData {
  theme: string;
  members: RichMember[];
  groupId: number;
  voId: number;
}
@Component({
  selector: 'app-copy-members-dialog',
  templateUrl: './copy-members-dialog-component.html',
  styleUrls: ['./copy-members-dialog-component.scss'],
})
export class CopyMembersDialogComponent implements OnInit {
  loading = false;
  copyType: 'all' | 'selection' = 'all';
  filterValue = '';
  tableId = TABLE_VO_GROUPS;
  assignableGroups: Group[] = [];
  selection = new SelectionModel<Group>(true, []);

  private groupAttrNames = [Urns.GROUP_SYNC_ENABLED, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING];

  constructor(
    public dialogRef: MatDialogRef<CopyMembersDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: CopyMembersDialogData,
    private groupsService: GroupsManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private translate: PerunTranslateService,
    private notificator: NotificatorService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    if (this.data.members.length > 0) {
      this.copyType = 'selection';
    }

    this.groupsService
      .getAllRichGroupsWithAttributesByNames(this.data.voId, this.groupAttrNames)
      .subscribe((groups) => {
        this.assignableGroups = this.filterAssignableGroups(groups);
        this.loading = false;
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.loading = true;
    const memberIds =
      this.copyType === 'selection' ? this.data.members.map((member) => member.id) : [];
    this.groupsService
      .copyMembers(
        this.data.groupId,
        this.selection.selected.map((group) => group.id),
        memberIds,
      )
      .subscribe({
        next: () => {
          this.notificator.showSuccess(this.translate.instant('DIALOGS.COPY_MEMBERS.SUCCESS'));
          this.dialogRef.close(true);
        },
        error: () => {
          this.notificator.showError(this.translate.instant('DIALOGS.COPY_MEMBERS.ERROR'));
          this.loading = false;
        },
      });
  }
  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  private filterAssignableGroups(groups: RichGroup[]): RichGroup[] {
    const assignableGroups: RichGroup[] = [];
    for (const grp of groups) {
      if (
        grp.name !== 'members' &&
        grp.id !== this.data.groupId &&
        !(
          isGroupSynchronized(grp) ||
          hasBooleanAttributeEnabled(grp.attributes, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING)
        ) &&
        this.guiAuthResolver.isAuthorized(
          'dest-copyMembers_Group_List<Group>_List<Member>_boolean_policy',
          [grp],
        )
      ) {
        assignableGroups.push(grp);
      }
    }
    return assignableGroups;
  }
}
