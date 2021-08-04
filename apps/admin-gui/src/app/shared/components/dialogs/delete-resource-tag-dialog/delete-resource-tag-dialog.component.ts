import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ResourcesManagerService, ResourceTag } from '@perun-web-apps/perun/openapi';

export interface DeleteResourceTagDialogDialogData {
  theme: string;
  voId: number;
  tagsForDelete: ResourceTag[];
}

@Component({
  selector: 'app-delete-resource-tag-dialog',
  templateUrl: './delete-resource-tag-dialog.component.html',
  styleUrls: ['./delete-resource-tag-dialog.component.scss']
})
export class DeleteResourceTagDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DeleteResourceTagDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DeleteResourceTagDialogDialogData,
              private resourceManager: ResourcesManagerService) { }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<ResourceTag>;
  theme: string;
  loading = false;

  ngOnInit() {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource(this.data.tagsForDelete);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    for (const resourceTag of this.data.tagsForDelete) {
      this.resourceManager.deleteResourceTag({resourceTag: resourceTag}).subscribe( () => {
        this.dialogRef.close(true);
      }, () => this.dialogRef.close(true));
    }
  }

}
