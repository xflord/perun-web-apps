import { Component, HostBinding, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ResourcesManagerService, RichResource, Vo } from '@perun-web-apps/perun/openapi';
import { RemoveResourceDialogComponent } from '../../../../../shared/components/dialogs/remove-resource-dialog/remove-resource-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TABLE_VO_RESOURCES_LIST } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-resources-preview',
  templateUrl: './vo-resources-preview.component.html',
  styleUrls: ['./vo-resources-preview.component.scss'],
})
export class VoResourcesPreviewComponent implements OnInit {
  static id = 'VoResourcesPreviewComponent';

  @HostBinding('class.router-component') true;
  vo: Vo;
  resources: RichResource[] = [];
  selected = new SelectionModel<RichResource>(true, []);
  loading: boolean;
  filterValue = '';
  displayedColumns: string[] = [];
  tableId = TABLE_VO_RESOURCES_LIST;
  removeAuth: boolean;
  routeAuth = false;

  constructor(
    private resourcesManager: ResourcesManagerService,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.refreshTable();
  }

  setAuthRights(): void {
    this.removeAuth = this.authResolver.isAuthorized('deleteResource_Resource_policy', [this.vo]);

    if (this.resources.length !== 0) {
      this.routeAuth = this.authResolver.isAuthorized('getResourceById_int_policy', [
        this.vo,
        this.resources[0],
      ]);
    }

    this.displayedColumns = this.removeAuth
      ? ['select', 'id', 'name', 'facility', 'tags', 'description']
      : ['id', 'name', 'facility', 'tags', 'description'];
  }

  refreshTable(): void {
    this.loading = true;
    this.resourcesManager.getRichResources(this.vo.id).subscribe((resources) => {
      this.resources = resources;
      this.selected.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  deleteSelectedResources(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { theme: 'vo-theme', resources: this.selected.selected };

    const dialogRef = this.dialog.open(RemoveResourceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }
}
