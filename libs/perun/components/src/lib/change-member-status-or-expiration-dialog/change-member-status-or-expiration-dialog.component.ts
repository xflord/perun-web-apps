import { Component, Inject, OnInit } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ChangeMemberStatusOrExpirationDialogData {
  member: RichMember;
  voId?: number;
  groupId?: number;
}

@Component({
  selector: 'perun-web-apps-change-member-status-or-expiration-dialog',
  templateUrl: './change-member-status-or-expiration-dialog.component.html',
  styleUrls: ['./change-member-status-or-expiration-dialog.component.scss'],
})
export class ChangeMemberStatusOrExpirationDialogComponent implements OnInit {
  theme: string;
  voId: number;
  groupId: number;
  member: RichMember;
  statusChanged = false;

  constructor(
    public dialogRef: MatDialogRef<ChangeMemberStatusOrExpirationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeMemberStatusOrExpirationDialogData
  ) {}

  ngOnInit(): void {
    this.theme = this.data.groupId ? 'group-theme' : 'vo-theme';
    this.voId = this.data.voId;
    this.groupId = this.data.groupId;
    this.member = this.data.member;
  }

  cancel(): void {
    if (this.statusChanged) {
      this.dialogRef.close();
    } else {
      this.dialogRef.close('closedWithoutChange');
    }
  }
}
