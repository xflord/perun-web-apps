import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-session-expiration-dialog',
  templateUrl: './session-expiration-dialog.component.html',
  styleUrls: ['./session-expiration-dialog.component.scss'],
})
export class SessionExpirationDialogComponent {
  constructor(private dialogRef: MatDialogRef<SessionExpirationDialogComponent>) {}

  close(): void {
    this.dialogRef.close(true);
  }
}
