import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ServerDownDialogData {
  title: string;
  message: string;
  action: string;
}

@Component({
  selector: 'perun-web-apps-server-down-dialog',
  templateUrl: './server-down-dialog.component.html',
  styleUrls: ['./server-down-dialog.component.scss'],
})
export class ServerDownDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ServerDownDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServerDownDialogData
  ) {}

  refresh(): void {
    location.reload();
  }
}
