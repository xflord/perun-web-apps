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
  sshKey: string;

  constructor(
    private dialogRef: MatDialogRef<ShowSshDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ShowSshDialogData
  ) {}

  ngOnInit(): void {
    this.sshKey = this.data.value;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
