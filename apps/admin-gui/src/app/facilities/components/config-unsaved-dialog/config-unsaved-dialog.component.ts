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
  constructor(
    public dialogRef: MatDialogRef<ConfigUnsavedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfigUnsavedDialogData
  ) {}

  theme = '';
  ngOnInit(): void {
    this.theme = this.data.theme;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSkip() {
    this.dialogRef.close(true);
  }
}
