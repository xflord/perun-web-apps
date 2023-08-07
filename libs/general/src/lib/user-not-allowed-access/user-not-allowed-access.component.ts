import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-user-dont-exist-dialog',
  templateUrl: './user-not-allowed-access.component.html',
  styleUrls: ['./user-not-allowed-access.component.scss'],
})
export class UserNotAllowedAccessComponent {
  constructor(public dialogRef: MatDialogRef<UserNotAllowedAccessComponent>) {}

  redirect(): void {
    this.dialogRef.close();
  }
}
