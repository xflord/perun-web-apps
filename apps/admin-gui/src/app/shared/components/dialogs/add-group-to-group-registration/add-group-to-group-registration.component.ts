import { Component, Inject, OnInit } from '@angular/core';
import {
  Group,
  GroupsManagerService,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddGroupToGroupRegistrationDialogData {
  theme: string;
  groupId: number;
  embeddedFormItemId: number;
  assignedGroups: number[];
}

@Component({
  selector: 'app-add-group-to-group-registration',
  templateUrl: './add-group-to-group-registration.component.html',
  styleUrls: ['./add-group-to-group-registration.component.scss'],
})
export class AddGroupToGroupRegistrationComponent implements OnInit {
  loading = false;
  theme: string;
  unAssignedGroups: Group[] = [];
  selection = new SelectionModel<Group>(true, []);

  constructor(
    public dialogRef: MatDialogRef<AddGroupToGroupRegistrationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddGroupToGroupRegistrationDialogData,
    private groupService: GroupsManagerService,
    private registrarService: RegistrarManagerService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.groupService.getAllSubGroups(this.data.groupId).subscribe({
      next: (groups) => {
        this.unAssignedGroups = groups.filter(
          (group) => !this.data.assignedGroups.includes(group.id),
        );
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onAdd(): void {
    this.loading = true;
    this.registrarService
      .addSubgroupsToAutoRegistration(
        this.selection.selected.map((group) => group.id),
        this.data.groupId,
        this.data.embeddedFormItemId,
      )
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }
}
