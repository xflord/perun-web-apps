import { Component, Inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ResourcesManagerService, RichResource } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface RemoveGroupResourceDialogData {
  theme: string;
  groupId: number;
  resources: RichResource[];
}

@Component({
  selector: 'app-remove-group-resource-dialog',
  templateUrl: './remove-group-resource-dialog.component.html',
  styleUrls: ['./remove-group-resource-dialog.component.scss'],
})
export class RemoveGroupResourceDialogComponent implements OnInit {
  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<RichResource>;

  constructor(
    public dialogRef: MatDialogRef<RemoveGroupResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveGroupResourceDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private resourcesManager: ResourcesManagerService
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<RichResource>(this.data.resources);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    const resourceIds = this.data.resources.map((res) => res.id);
    this.resourcesManager.removeGroupFromResources(this.data.groupId, resourceIds).subscribe(
      () => {
        this.translate
          .get('DIALOGS.REMOVE_RESOURCES.SUCCESS')
          .subscribe((successMessage: string) => {
            this.loading = false;
            this.notificator.showSuccess(successMessage);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }
}
