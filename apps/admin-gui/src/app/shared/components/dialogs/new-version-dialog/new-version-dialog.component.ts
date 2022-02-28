import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-version-dialog',
  templateUrl: './new-version-dialog.component.html',
  styleUrls: ['./new-version-dialog.component.scss'],
})
export class NewVersionDialogComponent {
  constructor(private dialogRef: MatDialogRef<NewVersionDialogComponent>) {}

  onReload(): void {
    location.reload();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
