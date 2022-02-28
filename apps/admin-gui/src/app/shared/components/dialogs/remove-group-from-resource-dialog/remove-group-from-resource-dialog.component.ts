import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Group, ResourcesManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface RemoveGroupFromResourceDialogData {
  resourceId: number;
  groups: Group[];
  theme: string;
}

@Component({
  selector: 'app-perun-web-apps-remove-group-from-resource-dialog',
  templateUrl: './remove-group-from-resource-dialog.component.html',
  styleUrls: ['./remove-group-from-resource-dialog.component.scss'],
})
export class RemoveGroupFromResourceDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Group>;
  loading = false;
  theme: string;

  constructor(
    private dialogRef: MatDialogRef<RemoveGroupFromResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveGroupFromResourceDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private resourceManager: ResourcesManagerService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<Group>(this.data.groups);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const groupsId: number[] = [];
    for (const group of this.data.groups) {
      groupsId.push(group.id);
    }
    this.loading = true;
    this.resourceManager.removeGroupsFromResource(groupsId, this.data.resourceId).subscribe(
      () => {
        this.translate
          .get('DIALOGS.REMOVE_GROUP_FROM_RESOURCE.SUCCESS')
          .subscribe((successMessage: string) => {
            this.notificator.showSuccess(successMessage);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }
}
