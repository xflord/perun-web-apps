import { Component, Inject, OnInit } from '@angular/core';
import {
  Group,
  GroupsManagerService,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddGroupToVoRegistrationDialogData {
  theme: string;
  voId: number;
  embeddedFormItemId: number;
  assignedGroups: number[];
}

@Component({
  selector: 'app-add-group-to-vo-registration',
  templateUrl: './add-group-to-vo-registration.component.html',
  styleUrls: ['./add-group-to-vo-registration.component.scss'],
})
export class AddGroupToVoRegistrationComponent implements OnInit {
  loading = false;
  theme: string;
  unAssignedGroups: Group[] = [];
  selection = new SelectionModel<Group>(true, []);

  constructor(
    public dialogRef: MatDialogRef<AddGroupToVoRegistrationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddGroupToVoRegistrationDialogData,
    private groupService: GroupsManagerService,
    private registrarService: RegistrarManagerService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.groupService.getAllGroups(this.data.voId).subscribe({
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
      .addVoGroupsToAutoRegistration(
        this.selection.selected.map((group) => group.id),
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
