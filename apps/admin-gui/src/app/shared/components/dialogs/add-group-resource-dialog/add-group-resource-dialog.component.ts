import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { Group, ResourcesManagerService, RichResource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { ResourcesListComponent } from '@perun-web-apps/perun/components';
import { TABLE_ASSIGN_RESOURCE_TO_GROUP, TableConfigService } from '@perun-web-apps/config/table-config';
import { MatStepper } from '@angular/material/stepper';

export interface AddGroupResourceDialogData {
  theme: string;
  voId: number;
  group: Group
  unwantedResources: number[];
}

@Component({
  selector: 'app-add-group-resource-dialog',
  templateUrl: './add-group-resource-dialog.component.html',
  styleUrls: ['./add-group-resource-dialog.component.scss']
})
export class AddGroupResourceDialogComponent implements OnInit {

  @ViewChild('stepper') stepper: MatStepper;

  @ViewChild('list', {})
  list: ResourcesListComponent;

  loading: boolean;
  filterValue = '';
  resources: RichResource[] = [];
  selection = new SelectionModel<RichResource>(true, []);
  theme = '';
  async = true;
  autoAssignSubgroups = false;
  asActive = true;

  tableId = TABLE_ASSIGN_RESOURCE_TO_GROUP;
  pageSize: number;

  autoAssignHint: string;
  asActiveHint: string;
  asyncHint: string;

  constructor(public dialogRef: MatDialogRef<AddGroupResourceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddGroupResourceDialogData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private resourcesManager: ResourcesManagerService,
              private tableConfigService: TableConfigService,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.loading = true;
    this.autoAssignHint = this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.AUTO_SUBGROUPS_OFF_HINT');
    this.asActiveHint = this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ACTIVE_ON_HINT');
    this.asyncHint = this.translate.instant('DIALOGS.ADD_GROUP_RESOURCES.ASYNC_ON_HINT');
    this.resourcesManager.getRichResources(this.data.voId).subscribe(resources => {
      this.resources = resources.filter(res => !this.data.unwantedResources.includes(res.id));
      this.loading = false;
      this.cd.detectChanges();
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
