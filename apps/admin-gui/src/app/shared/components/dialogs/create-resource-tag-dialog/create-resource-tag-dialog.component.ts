import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResourcesManagerService } from '@perun-web-apps/perun/openapi';

export interface CreateResourceTagDialogDialogData {
  voId: number;
  theme: string;
}

@Component({
  selector: 'app-create-resource-tag-dialog',
  templateUrl: './create-resource-tag-dialog.component.html',
  styleUrls: ['./create-resource-tag-dialog.component.scss'],
})
export class CreateResourceTagDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<CreateResourceTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateResourceTagDialogDialogData,
    private resourceManager: ResourcesManagerService
  ) {}

  name = '';
  theme: string;
  loading = false;

  ngOnInit() {
    this.theme = this.data.theme;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.name !== '') {
      this.loading = true;
      this.resourceManager.createResourceTagWithTagName(this.name, this.data.voId).subscribe(
        () => {
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
    }
  }
}
