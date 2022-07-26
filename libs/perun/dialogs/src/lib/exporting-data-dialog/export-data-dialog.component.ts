import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-export-data-dialog',
  templateUrl: './export-data-dialog.component.html',
  styleUrls: ['./export-data-dialog.component.scss'],
})
export class ExportDataDialogComponent {
  constructor(private dialogRef: MatDialogRef<ExportDataDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
