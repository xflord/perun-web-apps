import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';

export interface RemoveAltPasswordDialogData {
  userId: number;
  passwordId: string;
  description: string[];
}

@Component({
  selector: 'perun-web-apps-remove-alt-password-dialog',
  templateUrl: './remove-alt-password-dialog.component.html',
  styleUrls: ['./remove-alt-password-dialog.component.scss'],
})
export class RemoveAltPasswordDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<RemoveAltPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: RemoveAltPasswordDialogData,
    private usersManagerService: UsersManagerService
  ) {}

  displayedColumns: string[] = ['description'];
  dataSource: MatTableDataSource<string>;
  loading: boolean;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<string>(this.data.description);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    this.usersManagerService
      .deleteAlternativePassword(this.data.userId, 'einfra', this.data.passwordId)
      .subscribe(() => {
        this.loading = false;
        this.dialogRef.close(true);
      });
  }
}
