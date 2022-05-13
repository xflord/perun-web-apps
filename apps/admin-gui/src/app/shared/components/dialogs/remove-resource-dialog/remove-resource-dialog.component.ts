import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ResourcesManagerService, RichResource } from '@perun-web-apps/perun/openapi';
import { DeleteDialogResult } from '@perun-web-apps/perun/dialogs';

export interface RemoveResourceDialogData {
  theme: string;
  resources: RichResource[];
}

@Component({
  selector: 'app-remove-resource-dialog',
  templateUrl: './remove-resource-dialog.component.html',
  styleUrls: ['./remove-resource-dialog.component.scss'],
})
export class RemoveResourceDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<RichResource>;
  loading = false;
  theme: string;

  constructor(
    public dialogRef: MatDialogRef<RemoveResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveResourceDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private resourcesManager: ResourcesManagerService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<RichResource>(this.data.resources);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.loading = true;
    if (this.data.resources.length === 0) {
      this.translate.get('DIALOGS.REMOVE_RESOURCES.SUCCESS').subscribe((successMessage: string) => {
        this.loading = false;
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
    } else {
      this.resourcesManager.deleteResource(this.data.resources[0].id).subscribe(
        () => {
          this.data.resources.shift();
          this.onDelete();
        },
        () => {
          this.dialogRef.close(true);
        }
      );
    }
  }

  onSubmit(result: DeleteDialogResult): void {
    if (result.deleted) {
      this.onDelete();
    } else {
      this.onCancel();
    }
  }
}
