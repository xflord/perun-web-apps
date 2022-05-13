import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { DeleteDialogResult } from '@perun-web-apps/perun/dialogs';

export interface DeleteGroupDialogData {
  theme: string;
  voId: number;
  groups: Group[];
}

@Component({
  selector: 'app-delete-group-dialog',
  templateUrl: './delete-group-dialog.component.html',
  styleUrls: ['./delete-group-dialog.component.scss'],
})
export class DeleteGroupDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Group>;
  theme: string;
  loading = false;
  relations: string[] = [];
  force = false;

  constructor(
    public dialogRef: MatDialogRef<DeleteGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteGroupDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private groupService: GroupsManagerService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<Group>(this.data.groups);
    this.relations.push(this.translate.instant('DIALOGS.DELETE_GROUP.SUBGROUP_RELATION') as string);
    this.relations.push(this.translate.instant('DIALOGS.DELETE_GROUP.MEMBER_RELATION') as string);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.loading = true;
    const groups: number[] = this.data.groups.map((elem) => elem.id);
    this.groupService.deleteGroups({ groups: groups, forceDelete: this.force }).subscribe(
      () => {
        this.translate.get('DIALOGS.DELETE_GROUP.SUCCESS').subscribe(
          (successMessage: string) => {
            this.notificator.showSuccess(successMessage);
            this.dialogRef.close(true);
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }

  onSubmit(result: DeleteDialogResult): void {
    this.force = result.force;
    if (result.deleted) {
      this.onDelete();
    } else {
      this.onCancel();
    }
  }
}
