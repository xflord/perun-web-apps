import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-application-form-item-dialog',
  templateUrl: './delete-application-form-item-dialog.component.html',
  styleUrls: ['./delete-application-form-item-dialog.component.scss'],
})
export class DeleteApplicationFormItemDialogComponent {
  constructor(private dialogRef: MatDialogRef<DeleteApplicationFormItemDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.dialogRef.close(true);
  }
}
