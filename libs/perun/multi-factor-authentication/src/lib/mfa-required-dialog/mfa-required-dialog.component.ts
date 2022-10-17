import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface MfaRequiredDialogData {
  mfaRoleException: boolean;
}

@Component({
  selector: 'perun-web-apps-mfa-required-dialog',
  templateUrl: './mfa-required-dialog.component.html',
  styleUrls: ['./mfa-required-dialog.component.scss'],
})
export class MfaRequiredDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<MfaRequiredDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MfaRequiredDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.dialogRef.close(true);
  }
}
