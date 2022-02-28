import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfigUnsavedDialogData {
  theme: string;
}

@Component({
  selector: 'app-config-unsaved-dialog',
  templateUrl: './config-unsaved-dialog.component.html',
  styleUrls: ['./config-unsaved-dialog.component.scss'],
})
export class ConfigUnsavedDialogComponent implements OnInit {
  theme = '';

  constructor(
    public dialogRef: MatDialogRef<ConfigUnsavedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfigUnsavedDialogData
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSkip(): void {
    this.dialogRef.close(true);
  }
}
