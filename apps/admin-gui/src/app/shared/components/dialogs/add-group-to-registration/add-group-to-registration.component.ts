import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Group,
  GroupsManagerService,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_ADD_GROUP_TO_REGISTRATION } from '@perun-web-apps/config/table-config';

export interface AddGroupToRegistrationDialogData {
  theme: string;
  voId: number;
  assignedGroups: number[];
}

@Component({
  selector: 'app-add-group-to-registration',
  templateUrl: './add-group-to-registration.component.html',
  styleUrls: ['./add-group-to-registration.component.css'],
})
export class AddGroupToRegistrationComponent implements OnInit {
  loading = false;
  theme: string;
  unAssignedGroups: Group[];
  selection = new SelectionModel<Group>(true, []);
  filterValue = '';

  tableId = TABLE_ADD_GROUP_TO_REGISTRATION;

  constructor(
    public dialogRef: MatDialogRef<AddGroupToRegistrationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddGroupToRegistrationDialogData,
    private groupService: GroupsManagerService,
    private registrarService: RegistrarManagerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.groupService.getAllGroups(this.data.voId).subscribe((groups) => {
      this.unAssignedGroups = groups.filter(
        (group) => !this.data.assignedGroups.includes(group.id)
      );
      this.loading = false;
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onAdd(): void {
    this.loading = true;
    this.registrarService
      .addGroupsToAutoRegistration(this.selection.selected.map((group) => group.id))
      .subscribe(
        () => {
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
  }
}
