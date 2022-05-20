import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  EnrichedVo,
  Group,
  GroupsManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { TABLE_CREATE_RELATION_GROUP_DIALOG } from '@perun-web-apps/config/table-config';

export interface CreateRelationDialogData {
  theme: string;
  groups: Group[];
  group: Group;
  voId: number;
  reverse: boolean;
}

@Component({
  selector: 'app-create-relation-dialog',
  templateUrl: './create-relation-dialog.component.html',
  styleUrls: ['./create-relation-dialog.component.scss'],
})
export class CreateRelationDialogComponent implements OnInit {
  selection = new SelectionModel<Group>(false, []);
  groups: Group[];
  theme: string;
  filterValue = '';
  initLoading: boolean;
  loading: boolean;
  tableId = TABLE_CREATE_RELATION_GROUP_DIALOG;
  thisVo: EnrichedVo;
  groupsToNotInclude: number[];
  groupsToDisable: Set<number> = new Set<number>();
  vosToSelect: Vo[] = [];
  private successMessage: string;

  constructor(
    private dialogRef: MatDialogRef<CreateRelationDialogComponent>,
    private groupService: GroupsManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private guiAuthResolver: GuiAuthResolver,
    private voService: VosManagerService,
    @Inject(MAT_DIALOG_DATA) public data: CreateRelationDialogData
  ) {
    translate
      .get('DIALOGS.CREATE_RELATION.SUCCESS')
      .subscribe((value: string) => (this.successMessage = value));
  }

  ngOnInit(): void {
    this.initLoading = true;
    this.groupService.getGroupUnions(this.data.group.id, !this.data.reverse).subscribe(
      (unionGroups) => {
        unionGroups = unionGroups.concat(this.data.groups);
        this.groupsToNotInclude = unionGroups.map((elem) => elem.id);
        this.voService.getEnrichedVoById(this.data.voId).subscribe((enrichedVo) => {
          this.thisVo = enrichedVo;
          this.vosToSelect = enrichedVo.memberVos.filter((vo) =>
            this.guiAuthResolver.isAuthorized('getAllAllowedGroupsToHierarchicalVo_Vo_policy', [vo])
          );
          this.vosToSelect.push(enrichedVo.vo);
          this.getGroupsToInclude(this.data.voId);
          this.initLoading = false;
        });
      },
      () => (this.initLoading = false)
    );
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getGroupsToInclude(voId: number): void {
    this.loading = true;
    if (voId === this.data.voId) {
      this.groupService.getAllGroups(this.data.voId).subscribe(
        (allGroups) => {
          this.finishLoadingGroups(allGroups);
        },
        () => (this.loading = false)
      );
    } else {
      this.groupService.getVoAllAllowedGroupsToHierarchicalVo(this.data.voId, voId).subscribe(
        (groups) => {
          this.finishLoadingGroups(groups);
        },
        () => (this.loading = false)
      );
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.groupService.createGroupUnion(this.data.group.id, this.selection.selected[0].id).subscribe(
      () => {
        this.notificator.showSuccess(this.successMessage);
        this.loading = false;
        this.dialogRef.close(true);
      },
      () => (this.loading = false)
    );
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  private setGroupsToDisable(): void {
    for (const group of this.groups) {
      if (
        !this.guiAuthResolver.isAuthorized('result-createGroupUnion_Group_Group_policy', [
          this.data.group,
        ]) ||
        !this.guiAuthResolver.isAuthorized('operand-createGroupUnion_Group_Group_policy', [group])
      ) {
        this.groupsToDisable.add(group.id);
      }
    }
  }

  private finishLoadingGroups(groups: Group[]): void {
    this.groups = groups.filter(
      (group) => !this.groupsToNotInclude.includes(group.id) && group.id !== this.data.group.id
    );
    this.setGroupsToDisable();
    this.selection.clear();
    this.loading = false;
  }
}
