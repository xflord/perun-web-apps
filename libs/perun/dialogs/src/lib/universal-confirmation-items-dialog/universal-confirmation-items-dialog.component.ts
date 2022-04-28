import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

export interface UniversalConfirmationItemsDialogData {
  theme: string;
  title: string;
  description: string;
  items: string[];
  alert: string;
  type: 'remove' | 'confirmation';
  showAsk: boolean;
}

@Component({
  selector: 'perun-web-apps-universal-confirmation-items-dialog',
  templateUrl: './universal-confirmation-items-dialog.component.html',
  styleUrls: ['./universal-confirmation-items-dialog.component.scss'],
})
export class UniversalConfirmationItemsDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UniversalConfirmationItemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UniversalConfirmationItemsDialogData
  ) {}

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<string>;
  theme: string;
  loading = false;

  ngOnInit() {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<string>(this.data.items);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.dialogRef.close(true);
  }
}
