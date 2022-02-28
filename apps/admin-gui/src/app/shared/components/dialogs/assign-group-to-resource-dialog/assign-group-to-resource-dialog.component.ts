import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  Group,
  GroupsManagerService,
  Resource,
  ResourcesManagerService,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_ASSIGN_GROUP_TO_RESOURCE_DIALOG } from '@perun-web-apps/config/table-config';
import { MatStepper } from '@angular/material/stepper';

export interface AssignGroupToResourceDialogData {
  theme: string;
  resource: Resource;
  onlyAutoAssignedGroups: Group[];
}

@Component({
  selector: 'app-perun-web-apps-assign-group-to-resource-dialog',
  templateUrl: './assign-group-to-resource-dialog.component.html',
  styleUrls: ['./assign-group-to-resource-dialog.component.scss'],
})
export class AssignGroupToResourceDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  loading = false;
  theme: string;
  unAssignedGroups: Group[] = this.data.onlyAutoAssignedGroups;
  async = true;
  autoAssignSubgroups = false;
  asActive = true;
  selection = new SelectionModel<Group>(true, []);
  filterValue = '';
  tableId = TABLE_ASSIGN_GROUP_TO_RESOURCE_DIALOG;
  autoAssignHint: string;
  asActiveHint: string;
  asyncHint: string;
  private resource: Resource;

  constructor(
    private dialogRef: MatDialogRef<AssignGroupToResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignGroupToResourceDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private resourceManager: ResourcesManagerService,
    private groupService: GroupsManagerService,
    public guiAuthResolver: GuiAuthResolver,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.resource = this.data.resource;
    this.autoAssignHint = this.translate.instant(
      'DIALOGS.ASSIGN_GROUP_TO_RESOURCE.AUTO_SUBGROUPS_OFF_HINT'
    ) as string;
    this.asActiveHint = this.translate.instant(
      'DIALOGS.ASSIGN_GROUP_TO_RESOURCE.ACTIVE_ON_HINT'
    ) as string;
    this.asyncHint = this.translate.instant(
      'DIALOGS.ASSIGN_GROUP_TO_RESOURCE.ASYNC_ON_HINT'
    ) as string;
    this.resourceManager.getAssignedGroups(this.resource.id).subscribe(
      (assignedGroups) => {
        this.groupService.getAllGroups(this.resource.voId).subscribe(
          (allGroups) => {
            for (const allGroup of allGroups) {
              if (
                assignedGroups.findIndex((item) => item.id === allGroup.id) === -1 &&
                this.guiAuthResolver.isAuthorized(
                  'assignGroupsToResource_List<Group>_Resource_policy',
                  [this.resource, allGroup]
                )
              ) {
                this.unAssignedGroups.push(allGroup);
              }
            }
            this.loading = false;
            this.cd.detectChanges();
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    this.loading = true;
    const addedGroups: number[] = [];
    for (const group of this.selection.selected) {
      addedGroups.push(group.id);
    }

    this.resourceManager
      .assignGroupsToResource(
        addedGroups,
        this.resource.id,
        this.async,
        !this.asActive,
        this.autoAssignSubgroups
      )
      .subscribe(
        () => {
          this.translate
            .get('DIALOGS.ASSIGN_GROUP_TO_RESOURCE.SUCCESS_MESSAGE')
            .subscribe((message: string) => {
              this.notificator.showSuccess(message);
              this.dialogRef.close(true);
            });
        },
        () => (this.loading = false)
      );
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  canAddGroups(): boolean {
    let canAdd = true;
    this.selection.selected.forEach((group) => {
      if (
        !this.guiAuthResolver.isAuthorized('assignGroupsToResource_List<Group>_Resource_policy', [
          this.resource,
          group,
        ])
      ) {
        canAdd = false;
      }
    });
    return canAdd;
  }

  changeSubgroupsMessage(): void {
    this.autoAssignHint = this.autoAssignSubgroups
      ? (this.translate.instant(
          'DIALOGS.ASSIGN_GROUP_TO_RESOURCE.AUTO_SUBGROUPS_OFF_HINT'
        ) as string)
      : (this.translate.instant(
          'DIALOGS.ASSIGN_GROUP_TO_RESOURCE.AUTO_SUBGROUPS_ON_HINT'
        ) as string);
  }

  changeInactiveMessage(): void {
    this.asActiveHint = this.asActive
      ? (this.translate.instant('DIALOGS.ASSIGN_GROUP_TO_RESOURCE.ACTIVE_OFF_HINT') as string)
      : (this.translate.instant('DIALOGS.ASSIGN_GROUP_TO_RESOURCE.ACTIVE_ON_HINT') as string);
  }

  changeAsyncMessage(): void {
    this.asyncHint = this.async
      ? (this.translate.instant('DIALOGS.ASSIGN_GROUP_TO_RESOURCE.ASYNC_OFF_HINT') as string)
      : (this.translate.instant('DIALOGS.ASSIGN_GROUP_TO_RESOURCE.ASYNC_ON_HINT') as string);
  }

  stepperPrevious(): void {
    this.stepper.previous();
  }

  stepperNext(): void {
    this.stepper.next();
  }
}
