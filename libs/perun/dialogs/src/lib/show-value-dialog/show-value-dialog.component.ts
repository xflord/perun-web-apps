import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ShowValueDialogData {
  title: string;
  value: string;
}

@Component({
  selector: 'perun-web-apps-show-value-dialog',
  templateUrl: './show-value-dialog.component.html',
  styleUrls: ['./show-value-dialog.component.scss'],
})
export class ShowValueDialogComponent implements OnInit {
  value: string;
  title: string;

  constructor(
    private dialogRef: MatDialogRef<ShowValueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ShowValueDialogData
  ) {}

  ngOnInit(): void {
    this.value = this.data.value;
    this.title = this.data.title;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
