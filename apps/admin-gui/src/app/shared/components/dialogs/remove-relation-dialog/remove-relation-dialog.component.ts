import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';

export interface RemoveRelationDialogData {
  groups: Group[];
  theme: string;
  groupId: number;
  reverse: boolean;
}

@Component({
  selector: 'app-remove-relation-dialog',
  templateUrl: './remove-relation-dialog.component.html',
  styleUrls: ['./remove-relation-dialog.component.scss'],
})
export class RemoveRelationDialogComponent implements OnInit {
  successMessage: string;
  theme: string;
  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Group>;

  constructor(
    private dialogRef: MatDialogRef<RemoveRelationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: RemoveRelationDialogData,
    private notificator: NotificatorService,
    private groupService: GroupsManagerService,
    private translate: TranslateService
  ) {
    translate
      .get('DIALOGS.REMOVE_RELATION.SUCCESS')
      .subscribe((value: string) => (this.successMessage = value));
  }

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<Group>(this.data.groups);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    if (this.data.groups.length === 1) {
      const thisGroup = this.data.reverse ? this.data.groups[0].id : this.data.groupId;
      const otherGroup = this.data.reverse ? this.data.groupId : this.data.groups[0].id;
      this.groupService.removeGroupUnion(thisGroup, otherGroup).subscribe(
        () => {
          this.notificator.showSuccess(this.successMessage);
          this.loading = false;
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
    } else {
      const thisGroup = this.data.reverse ? this.data.groups.shift().id : this.data.groupId;
      const otherGroup = this.data.reverse ? this.data.groupId : this.data.groups.shift().id;
      this.groupService.removeGroupUnion(thisGroup, otherGroup).subscribe(
        () => {
          this.onSubmit();
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
    }
  }
}
