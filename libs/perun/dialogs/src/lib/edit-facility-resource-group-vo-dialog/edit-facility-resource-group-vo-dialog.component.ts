import { Component, Inject, OnInit } from '@angular/core';
import {
  FacilitiesManagerService,
  Facility,
  Group,
  GroupsManagerService,
  Resource,
  ResourcesManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl, Validators } from '@angular/forms';

export enum EditFacilityResourceGroupVoDialogOptions {
  FACILITY,
  RESOURCE,
  VO,
  GROUP,
}

export interface EditFacilityResourceGroupVoDialogData {
  theme: string;
  facility: Facility;
  resource: Resource;
  vo: Vo;
  group: Group;
  dialogType: EditFacilityResourceGroupVoDialogOptions;
}

@Component({
  selector: 'perun-web-apps-edit-facility-resource-group-vo-dialog',
  templateUrl: './edit-facility-resource-group-vo-dialog.component.html',
  styleUrls: ['./edit-facility-resource-group-vo-dialog.component.scss'],
})
export class EditFacilityResourceGroupVoDialogComponent implements OnInit {
  invalidNameMessage: string =
    this.data.dialogType === EditFacilityResourceGroupVoDialogOptions.GROUP
      ? (this.store.get('group_name_error_message') as string)
      : '';

  theme: string;
  nameCtrl: UntypedFormControl;
  descriptionCtrl: UntypedFormControl;
  shortName: string;
  dialogType: EditFacilityResourceGroupVoDialogOptions;
  loading = false;
  secondaryRegex: string =
    this.data.dialogType === EditFacilityResourceGroupVoDialogOptions.GROUP
      ? (this.store.get('group_name_secondary_regex') as string)
      : '';

  constructor(
    private dialogRef: MatDialogRef<EditFacilityResourceGroupVoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EditFacilityResourceGroupVoDialogData,
    private notificator: NotificatorService,
    private translateService: TranslateService,
    private facilitiesManager: FacilitiesManagerService,
    private resourcesManager: ResourcesManagerService,
    private groupsManager: GroupsManagerService,
    private vosManager: VosManagerService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dialogType = this.data.dialogType;
    switch (this.dialogType) {
      case EditFacilityResourceGroupVoDialogOptions.FACILITY:
        this.nameCtrl = new UntypedFormControl(this.data.facility.name, [
          Validators.required,
          Validators.pattern('.*[\\S]+.*'),
          Validators.maxLength(129),
        ]);
        this.descriptionCtrl = new UntypedFormControl(this.data.facility.description);
        break;
      case EditFacilityResourceGroupVoDialogOptions.RESOURCE:
        this.nameCtrl = new UntypedFormControl(this.data.resource.name, [
          Validators.required,
          Validators.pattern('.*[\\S]+.*'),
        ]);
        this.descriptionCtrl = new UntypedFormControl(this.data.resource.description);
        break;
      case EditFacilityResourceGroupVoDialogOptions.GROUP: {
        const nameParts = this.data.group.name.split(':');
        this.nameCtrl = new UntypedFormControl(nameParts[nameParts.length - 1], [
          Validators.required,
          Validators.pattern('.*[\\S]+.*'),
          Validators.pattern(this.secondaryRegex),
          Validators.maxLength(129),
        ]);
        this.descriptionCtrl = new UntypedFormControl(this.data.group.description);
        break;
      }
      case EditFacilityResourceGroupVoDialogOptions.VO:
        this.shortName = this.data.vo.shortName;
        this.nameCtrl = new UntypedFormControl(this.data.vo.name, [
          Validators.required,
          Validators.pattern('.*[\\S]+.*'),
          Validators.maxLength(129),
        ]);
        this.descriptionCtrl = new UntypedFormControl();
        break;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.loading = true;
    switch (this.dialogType) {
      case EditFacilityResourceGroupVoDialogOptions.FACILITY:
        this.editFacility();
        break;
      case EditFacilityResourceGroupVoDialogOptions.RESOURCE:
        this.editResource();
        break;
      case EditFacilityResourceGroupVoDialogOptions.GROUP:
        this.editGroup();
        break;
      case EditFacilityResourceGroupVoDialogOptions.VO:
        this.editVo();
        break;
    }
  }

  editResource(): void {
    this.data.resource.name = this.nameCtrl.value as string;
    this.data.resource.description = this.descriptionCtrl.value as string;
    this.resourcesManager.updateResource({ resource: this.data.resource }).subscribe(
      () => {
        this.translateService
          .get('DIALOGS.EDIT_FACILITY_RESOURCE_GROUP_VO.RESOURCE_SUCCESS')
          .subscribe((message: string) => {
            this.notificator.showSuccess(message);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }

  editFacility(): void {
    this.data.facility.name = this.nameCtrl.value as string;
    this.data.facility.description = this.descriptionCtrl.value as string;
    this.facilitiesManager.updateFacility({ facility: this.data.facility }).subscribe(
      () => {
        this.translateService
          .get('DIALOGS.EDIT_FACILITY_RESOURCE_GROUP_VO.FACILITY_SUCCESS')
          .subscribe((message: string) => {
            this.notificator.showSuccess(message);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }

  editGroup(): void {
    this.groupsManager.getGroupById(this.data.group.id).subscribe(
      (grp) => {
        const group = grp;
        group.name = this.nameCtrl.value as string;
        group.description = this.descriptionCtrl.value as string;
        this.groupsManager.updateGroup({ group: group }).subscribe(
          () => {
            this.translateService
              .get('DIALOGS.EDIT_FACILITY_RESOURCE_GROUP_VO.GROUP_SUCCESS')
              .subscribe((message: string) => {
                this.notificator.showSuccess(message);
                this.dialogRef.close(true);
              });
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }

  editVo(): void {
    this.data.vo.name = this.nameCtrl.value as string;
    this.vosManager.updateVo({ vo: this.data.vo }).subscribe(
      () => {
        this.translateService
          .get('DIALOGS.EDIT_FACILITY_RESOURCE_GROUP_VO.VO_SUCCESS')
          .subscribe((message: string) => {
            this.notificator.showSuccess(message);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }
}
