import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Group,
  GroupsManagerService,
  Resource,
  ResourcesManagerService,
} from '@perun-web-apps/perun/openapi';

export interface ChangeGroupResourceAssigmentDialogComponentData {
  theme: string;
  status: string;
  groupId: number;
  resourceId: number;
}

@Component({
  selector: 'perun-web-apps-change-group-resource-assigment-dialog',
  templateUrl: './change-group-resource-assigment-dialog.component.html',
  styleUrls: ['./change-group-resource-assigment-dialog.component.scss'],
})
export class ChangeGroupResourceAssigmentDialogComponent implements OnInit {
  loading = false;
  status: string;
  asyncValidation = false;
  theme: string;
  resource: Resource = null;
  group: Group = null;

  constructor(
    private dialogRef: MatDialogRef<ChangeGroupResourceAssigmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ChangeGroupResourceAssigmentDialogComponentData,
    private resourceService: ResourcesManagerService,
    private groupService: GroupsManagerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.status = this.data.status;
    this.theme = this.data.theme;
    this.resourceService.getResourceById(this.data.resourceId).subscribe(
      (res) => {
        this.resource = res;

        this.groupService.getGroupById(this.data.groupId).subscribe(
          (grp) => {
            this.group = grp;
            this.loading = false;
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    if (this.status === 'ACTIVE') {
      this.resourceService
        .deactivateGroupResourceAssignment(this.data.groupId, this.data.resourceId)
        .subscribe(
          () => {
            this.dialogRef.close(true);
            this.loading = false;
          },
          () => (this.loading = false)
        );
    } else {
      this.resourceService
        .activateGroupResourceAssignment(
          this.data.groupId,
          this.data.resourceId,
          this.asyncValidation
        )
        .subscribe(
          () => {
            this.dialogRef.close(true);
            this.loading = false;
          },
          () => (this.loading = false)
        );
    }
  }

  getReversedStatus(): string {
    return this.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }
}
