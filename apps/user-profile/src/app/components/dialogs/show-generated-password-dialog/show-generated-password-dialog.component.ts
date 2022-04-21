import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ShowGeneratedPasswordDialogData {
  password: string;
}

@Component({
  selector: 'perun-web-apps-show-generated-password-dialog',
  templateUrl: './show-generated-password-dialog.component.html',
  styleUrls: ['./show-generated-password-dialog.component.scss'],
})
export class ShowGeneratedPasswordDialogComponent implements OnInit {
  password = '';

  constructor(
    private dialogRef: MatDialogRef<ShowGeneratedPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ShowGeneratedPasswordDialogData
  ) {}

  ngOnInit(): void {
    this.password = this.data.password;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
