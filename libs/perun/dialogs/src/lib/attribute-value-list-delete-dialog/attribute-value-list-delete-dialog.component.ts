import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AttributeValueListDeleteDialogData {
  name: string;
}

@Component({
  selector: 'perun-web-apps-attribute-value-list-delete-dialog',
  templateUrl: './attribute-value-list-delete-dialog.component.html',
  styleUrls: ['./attribute-value-list-delete-dialog.component.scss'],
})
export class AttributeValueListDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AttributeValueListDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AttributeValueListDeleteDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(true);
  }
}
