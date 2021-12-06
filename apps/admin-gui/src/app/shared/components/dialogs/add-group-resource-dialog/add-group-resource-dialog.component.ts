import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { Group, ResourcesManagerService, RichResource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { ResourcesListComponent } from '@perun-web-apps/perun/components';
import { MatStepper } from '@angular/material/stepper';
import { TABLE_ASSIGN_RESOURCE_TO_GROUP } from '@perun-web-apps/config/table-config';

export interface AddGroupResourceDialogData {
  theme: string;
  group: Group;
}

@Component({
  selector: 'app-add-group-resource-dialog',
  templateUrl: './add-group-resource-dialog.component.html',
  styleUrls: ['./add-group-resource-dialog.component.scss']
})
export class AddGroupResourceDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AddGroupResourceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddGroupResourceDialogData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private resourcesManager: ResourcesManagerService,
              public guiAuthResolver: GuiAuthResolver,
              private cd: ChangeDetectorRef) {
  }

  @ViewChild('list', {})
  list: ResourcesListComponent;

  @ViewChild('stepper') stepper: MatStepper;

  loading: boolean;
  filterValue = '';
  resources: RichResource[] = [];
  selection = new SelectionModel<RichResource>(true, []);
  theme = '';
  async = true;
  autoAssignSubgroups = false;
  asActive = true;

  tableId = TABLE_ASSIGN_RESOURCE_TO_GROUP;

  autoAssignHint: string;
  asActiveHint: string;
  asyncHint: string;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.loading = true;
    this.autoAssignHint = this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.AUTO_SUBGROUPS_OFF_HINT');
    this.asActiveHint = this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ACTIVE_ON_HINT');
    this.asyncHint = this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ASYNC_ON_HINT');
    this.resourcesManager.getRichResources(this.data.group.voId).subscribe(allResources => {
      this.resourcesManager.getAssignedResourcesWithGroup(this.data.group.id).subscribe(assignedResources => {
        for (const allResource of allResources) {
          if (assignedResources.findIndex(item => item.id === allResource.id) === -1
            && this.guiAuthResolver.isAuthorized('assignGroupToResources_Group_List<Resource>_policy',[this.data.group, allResource])) {
            this.resources.push(allResource);
          }
        }
        this.loading = false;
        this.cd.detectChanges();
      }, () => this.loading = false);
    }, () => this.loading = false );
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    const resourceIds = this.selection.selected.map(res => res.id);
    this.resourcesManager.assignGroupToResources(this.data.group.id, resourceIds, this.async, !this.asActive, this.autoAssignSubgroups)
      .subscribe(() => {
        this.translate.get('DIALOGS.ADD_GROUP_RESOURCES.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.dialogRef.close(true);
        });
    }, () => this.loading = false);
  }

  changeSubgroupsMessage() {
    this.autoAssignHint = this.autoAssignSubgroups ?
      this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.AUTO_SUBGROUPS_OFF_HINT') :
      this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.AUTO_SUBGROUPS_ON_HINT');
  }

  changeInactiveMessage() {
    this.asActiveHint = this.asActive ?
      this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ACTIVE_OFF_HINT') :
      this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ACTIVE_ON_HINT');
  }

  changeAsyncMessage() {
    this.asyncHint = this.async ?
      this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ASYNC_OFF_HINT') :
      this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ASYNC_ON_HINT');
  }

  stepperPrevious() {
    this.stepper.previous();
  }

  stepperNext() {
    this.stepper.next();
  }
}
