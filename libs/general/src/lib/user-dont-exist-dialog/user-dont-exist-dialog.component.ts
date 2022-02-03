import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-user-dont-exist-dialog',
  templateUrl: './user-dont-exist-dialog.component.html',
  styleUrls: ['./user-dont-exist-dialog.component.scss'],
})
export class UserDontExistDialogComponent {
  constructor(public dialogRef: MatDialogRef<UserDontExistDialogComponent>) {}
}
