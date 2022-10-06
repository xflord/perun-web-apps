import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  FacilitiesManagerService,
  Facility,
  Group,
  GroupsManagerService,
  PerunBean,
  Resource,
  ResourcesManagerService,
  RoleManagementRules,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';

export interface AddRoleDialogData {
  entityId: number;
  roles: Map<string, Map<string, Array<number>>>;
}

export interface AddRoleForm {
  role: string;
  entity: PerunBean;
}

@Component({
  selector: 'app-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  styleUrls: ['./add-role-dialog.component.scss'],
})
export class AddRoleDialogComponent implements OnInit {
  @Input() loading = false;
  @Input() rules: RoleManagementRules[];
  @Input() roles: Map<string, Map<string, number[]>>;
  @Input() theme: string;
  @Output() submitForm = new EventEmitter<AddRoleForm>();

  selectedRule: RoleManagementRules;
  selectedEntity: PerunBean = null;
  vos: Vo[] = [];
  groups: Group[] = [];
  facilities: Facility[] = [];
  resources: Resource[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddRoleDialogComponent>,
    private voService: VosManagerService,
    private groupService: GroupsManagerService,
    private facilityService: FacilitiesManagerService,
    private resourceService: ResourcesManagerService
  ) {}

  ngOnInit(): void {
    this.selectedRule = this.rules[0];
    if (this.rules.some((rule) => rule.primaryObject === 'Facility')) {
      // Not callable by SELF, need to check privilege
      this.facilityService
        .getAllFacilities()
        .subscribe({ next: (facilities) => (this.facilities = facilities) });
    }
    if (this.rules.some((rule) => rule.primaryObject === 'Vo')) {
      this.voService.getMyVos().subscribe({ next: (vos) => (this.vos = vos) });
    }
    this.groupService
      .getAllGroupsFromAllVos()
      .subscribe({ next: (groups) => (this.groups = groups) });
    this.resourceService.getAllResources().subscribe({
      next: (resources) => (this.resources = resources),
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  addRole(): void {
    this.submitForm.emit({ role: this.selectedRule.roleName, entity: this.selectedEntity });
  }
}
