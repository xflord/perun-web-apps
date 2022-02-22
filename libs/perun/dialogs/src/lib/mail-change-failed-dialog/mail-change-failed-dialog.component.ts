import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-mail-change-failed-dialog',
  templateUrl: './mail-change-failed-dialog.component.html',
  styleUrls: ['./mail-change-failed-dialog.component.scss'],
})
export class MailChangeFailedDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<MailChangeFailedDialogComponent>,
    private router: Router
  ) {}

  onClose(): void {
    void this.router.navigate([]);
    this.dialogRef.close();
  }
}
