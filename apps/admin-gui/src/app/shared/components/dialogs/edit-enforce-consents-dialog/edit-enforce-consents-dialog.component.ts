import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EditEnforceConsentsDialogData {
  theme: string;
  enforceConsents: boolean;
  consentHubName: string;
}

@Component({
  selector: 'app-perun-web-apps-edit-enforce-consents-dialog',
  templateUrl: './edit-enforce-consents-dialog.component.html',
  styleUrls: ['./edit-enforce-consents-dialog.component.scss'],
})
export class EditEnforceConsentsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditEnforceConsentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditEnforceConsentsDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.dialogRef.close(true);
  }
}
