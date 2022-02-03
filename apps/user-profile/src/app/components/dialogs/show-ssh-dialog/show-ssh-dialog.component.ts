import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ShowSshDialogData {
  value: string;
}

@Component({
  selector: 'perun-web-apps-show-ssh-dialog',
  templateUrl: './show-ssh-dialog.component.html',
  styleUrls: ['./show-ssh-dialog.component.scss'],
})
export class ShowSshDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<ShowSshDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ShowSshDialogData
  ) {}

  sshKey: string;

  ngOnInit(): void {
    this.sshKey = this.data.value;
  }

  onClose() {
    this.dialogRef.close();
  }
}
