import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  EnrichedFacility,
  FacilitiesManagerService,
  Group,
  GroupsManagerService,
  PerunBean,
  Resource,
  ResourcesManagerService,
  RoleManagementRules,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { ToEnrichedFacilityPipe } from '@perun-web-apps/perun/pipes';
import { UntypedFormControl } from '@angular/forms';
import { ImmediateFilterComponent } from '@perun-web-apps/perun/components';

export interface AddRoleDialogData {
  entityId: number;
  roles: Map<string, Map<string, Array<number>>>;
}

export interface AddRoleForm {
  role: RoleManagementRules;
  entities: PerunBean[];
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

  @ViewChild(ImmediateFilterComponent)
  filterComponent: ImmediateFilterComponent;

  selectedRule: RoleManagementRules;
  selected = new SelectionModel<PerunBean>(true, []);
  selectedFacilities = new SelectionModel<EnrichedFacility>(true, []);
  filterValue = '';
  vos: Vo[] = [];
  groups: Group[] = [];
  facilities: EnrichedFacility[] = [];
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
    this.loadObjects();
  }

  loadObjects(): void {
    if (this.rules.some((rule) => rule.primaryObject === 'Facility')) {
      // Not callable by SELF, need to check privilege
      this.facilityService.getAllFacilities().subscribe({
        next: (facilities) =>
          (this.facilities = new ToEnrichedFacilityPipe().transform(facilities)),
      });
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
    if (this.selectedRule.primaryObject === 'Facility') {
      this.submitForm.emit({
        role: this.selectedRule,
        entities: this.selectedFacilities.selected.map((ef) => ef.facility),
      });
    } else {
      this.submitForm.emit({ role: this.selectedRule, entities: this.selected.selected });
    }
  }

  resetSelection(selectedRule: RoleManagementRules): void {
    this.selectedRule = selectedRule;
    this.selected.clear();
    this.selectedFacilities.clear();
    this.filterValue = '';
    this.loadObjects();
    if (this.filterComponent) {
      this.filterComponent.formControl.setValue('');
    }
  }
}
