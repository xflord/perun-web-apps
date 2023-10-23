import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Group, GroupsManagerService, Vo } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { TABLE_ADD_HIERARCHICAL_INCLUSION } from '@perun-web-apps/config/table-config';

export interface AddGroupHierarchicalIncludeDialogData {
  theme: string;
  voId: number;
  parentVo: Vo;
  allowedGroupsIds: number[];
}

@Component({
  selector: 'app-add-group-hierarchical-include-dialog',
  templateUrl: './add-group-hierarchical-include-dialog.component.html',
  styleUrls: ['./add-group-hierarchical-include-dialog.component.scss'],
})
export class AddGroupHierarchicalIncludeDialogComponent implements OnInit {
  loading = false;
  theme: string;
  voId: number;
  parentVo: Vo;
  groups: Group[];
  selected = new SelectionModel<Group>(true, []);
  tableId = TABLE_ADD_HIERARCHICAL_INCLUSION;
  filterValue = '';

  constructor(
    private dialogRef: MatDialogRef<AddGroupHierarchicalIncludeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddGroupHierarchicalIncludeDialogData,
    private groupService: GroupsManagerService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.voId = this.data.voId;
    this.parentVo = this.data.parentVo;
    this.groupService.getAllGroups(this.voId).subscribe((groups) => {
      this.groups = groups.filter((group) => !this.data.allowedGroupsIds.includes(group.id));
      this.loading = false;
    });
  }

  applyFilter(filter: string): void {
    this.filterValue = filter;
  }

  close(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.loading = true;
    const groupIds = this.selected.selected.map((group) => group.id);
    this.groupService.allowGroupsToHierarchicalVo(groupIds, this.parentVo.id).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.ADD_GROUPS_HIERARCHICAL_INCLUSION.SUCCESS'),
        );
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
