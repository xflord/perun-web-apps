import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ResourcesManagerService,
  RichResource,
  ServicesManagerService,
  TasksManagerService,
} from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_RESOURCE_DELETE_SERVICE } from '@perun-web-apps/config/table-config';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';

export interface DeleteServiceFromFacilityData {
  theme: string;
  taskId: number;
  serviceId: number;
  facilityId: number;
  resource: RichResource[];
}

@Component({
  selector: 'app-delete-service-from-facility',
  templateUrl: './delete-service-from-facility.component.html',
  styleUrls: ['./delete-service-from-facility.component.scss'],
})
export class DeleteServiceFromFacilityComponent implements OnInit {
  loading = false;
  theme: string;
  taskId: number;
  resources: RichResource[] = [];
  displayedColumns = ['select', 'id', 'vo', 'name'];
  checkboxesDisabled = false;
  taskChecked = true;
  taskResultsChecked = true;
  destinationChecked = true;
  tableId = TABLE_RESOURCE_DELETE_SERVICE;
  dataSource = new MatTableDataSource<RichResource>(this.data.resource);
  selected = new SelectionModel<RichResource>(true, [...this.dataSource.data]);
  private serviceId: number;
  private facilityId: number;

  constructor(
    private dialogRef: MatDialogRef<DeleteServiceFromFacilityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteServiceFromFacilityData,
    private resourcesManager: ResourcesManagerService,
    private tasksManager: TasksManagerService,
    private serviceManager: ServicesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.taskId = this.data.taskId;
    this.serviceId = this.data.serviceId;
    this.facilityId = this.data.facilityId;
    this.resources = this.data.resource;
  }

  remove(): void {
    this.loading = true;

    // delete task results
    if (this.taskResultsChecked && !this.taskChecked && this.taskId !== null) {
      this.tasksManager.getTaskResultsForGUIByTask(this.taskId).subscribe((taskResults) => {
        taskResults.forEach((result) => {
          this.tasksManager.deleteTaskResultById({ taskResultId: result.id }).subscribe();
        });
      });
    }

    // delete task and task results
    if (this.taskChecked && this.taskId !== null) {
      this.tasksManager.deleteTask({ task: this.taskId }).subscribe();
    }

    // delete destination
    if (this.destinationChecked) {
      this.serviceManager
        .getDestinations(this.serviceId, this.facilityId)
        .subscribe((destinations) => {
          destinations.forEach((destination) => {
            this.serviceManager
              .removeDestination(
                this.serviceId,
                this.facilityId,
                destination.destination,
                destination.type
              )
              .subscribe();
          });
        });
    }

    // delete service from resources/facility
    this.selected.selected.forEach((resource) => {
      this.resourcesManager.removeService(resource.id, this.serviceId).subscribe(
        () => {
          this.translate
            .get('DIALOGS.REMOVE_SERVICE_FROM_FACILITY.SUCCESS')
            .subscribe((successMessage: string) => {
              this.notificator.showSuccess(successMessage);
              this.dialogRef.close(true);
            });
        },
        () => (this.loading = false)
      );
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  disableCheckboxes(allSelected: boolean): void {
    if (allSelected && this.checkboxesDisabled) {
      this.changeCheckboxes(true);
    }
    if (!allSelected && !this.checkboxesDisabled) {
      this.changeCheckboxes(false);
    }
  }

  changeCheckboxes(allSelected: boolean): void {
    this.checkboxesDisabled = !allSelected;
    this.taskChecked = allSelected;
    this.taskResultsChecked = allSelected;
    this.destinationChecked = allSelected;
    this.cd.detectChanges();
  }

  change(event: { source: { id: string }; checked: boolean }): void {
    switch (event.source.id) {
      case 'task': {
        this.taskChecked = event.checked;
        break;
      }
      case 'taskResults': {
        this.taskResultsChecked = event.checked;
        break;
      }
      case 'destination': {
        this.destinationChecked = event.checked;
        break;
      }
      default: {
        break;
      }
    }
  }
}
