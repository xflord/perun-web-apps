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
  name = '';
  theme: string;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<CreateResourceTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateResourceTagDialogDialogData,
    private resourceManager: ResourcesManagerService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
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
