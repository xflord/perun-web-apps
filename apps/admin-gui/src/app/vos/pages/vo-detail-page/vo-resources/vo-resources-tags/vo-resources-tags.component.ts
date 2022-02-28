import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CreateResourceTagDialogComponent } from '../../../../../shared/components/dialogs/create-resource-tag-dialog/create-resource-tag-dialog.component';
import { DeleteResourceTagDialogComponent } from '../../../../../shared/components/dialogs/delete-resource-tag-dialog/delete-resource-tag-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { ResourcesManagerService, ResourceTag, Vo } from '@perun-web-apps/perun/openapi';
import { TABLE_VO_RESOURCES_TAGS } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-vo-resources-tags',
  templateUrl: './vo-resources-tags.component.html',
  styleUrls: ['./vo-resources-tags.component.scss'],
})
export class VoResourcesTagsComponent implements OnInit {
  @HostBinding('class.router-component') true;

  loading = false;
  resourceTag: ResourceTag[] = [];
  selection = new SelectionModel<ResourceTag>(true, []);
  filterValue: string;
  tableId = TABLE_VO_RESOURCES_TAGS;
  displayedColumns: string[] = [];
  createAuth: boolean;
  deleteAuth: boolean;
  editAuth: boolean;
  private vo: Vo;

  constructor(
    private resourceManager: ResourcesManagerService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translator: TranslateService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.updateData();
  }

  deleteTag(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { tagsForDelete: this.selection.selected, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(DeleteResourceTagDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.translator.get('VO_DETAIL.RESOURCES.TAGS.DELETE_SUCCESS').subscribe((text: string) => {
          this.notificator.showSuccess(text);
        });
        this.updateData();
      }
    });
  }

  create(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { voId: this.vo.id, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(CreateResourceTagDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.translator.get('VO_DETAIL.RESOURCES.TAGS.CREATE_SUCCESS').subscribe((text: string) => {
          this.notificator.showSuccess(text);
        });
        this.updateData();
      }
    });
  }

  updateData(): void {
    this.loading = true;
    this.selection.clear();
    this.resourceManager.getAllResourcesTagsForVo(this.vo.id).subscribe((tags) => {
      this.resourceTag = tags;
      this.selection.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  private setAuthRights(): void {
    this.displayedColumns = [];

    this.createAuth = this.authResolver.isAuthorized('createResourceTag_ResourceTag_Vo_policy', [
      this.vo,
    ]);
    this.deleteAuth = this.authResolver.isAuthorized('deleteResourceTag_ResourceTag_policy', [
      this.vo,
    ]);
    this.editAuth = this.authResolver.isAuthorized('updateResourceTag_ResourceTag_policy', [
      this.vo,
    ]);

    this.displayedColumns = this.deleteAuth ? ['select', 'id', 'name'] : ['id', 'name'];

    if (this.editAuth) {
      this.displayedColumns.push('edit');
    }
  }
}
