import { Component, HostBinding, OnInit } from '@angular/core';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { ResourceState, TasksManagerService, Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-vo-resources-states',
  templateUrl: './vo-resources-states.component.html',
  styleUrls: ['./vo-resources-states.component.scss'],
})
export class VoResourcesStatesComponent implements OnInit {
  static id = 'VoResourcesStatesComponent';
  @HostBinding('class.router-component') true;
  loading = false;
  okPropagation: ResourceState[] = [];
  errorPropagation: ResourceState[] = [];
  resourceStates: ResourceState[] = [];

  vo: Vo;
  selectedIndex = 0;

  constructor(
    private taskService: TasksManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.taskService.getAllResourcesState(this.vo.id).subscribe(
      (resourceStates) => {
        this.resourceStates = resourceStates;
        this.okPropagation = [];
        this.errorPropagation = [];

        for (const resourceState of resourceStates) {
          let indicator = true;
          for (const task of resourceState.taskList) {
            if (
              task.status === 'ERROR' ||
              task.status === 'GENERROR' ||
              task.status === 'SENDERROR'
            ) {
              indicator = false;
              break;
            }
          }
          if (indicator) {
            this.okPropagation.push(resourceState);
          } else {
            this.errorPropagation.push(resourceState);
          }
        }
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }
}
