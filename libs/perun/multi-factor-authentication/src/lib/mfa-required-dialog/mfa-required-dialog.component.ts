import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-mfa-required-dialog',
  templateUrl: './mfa-required-dialog.component.html',
  styleUrls: ['./mfa-required-dialog.component.scss'],
})
export class MfaRequiredDialogComponent {
  constructor(private dialogRef: MatDialogRef<MfaRequiredDialogComponent>) {}

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.dialogRef.close(true);
  }
}
