import { Component, OnInit } from '@angular/core';
import { Resource, ResourcesManagerService, ResourceTag } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_RESOURCES_TAGS } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';
import { AddResourceTagToResourceDialogComponent } from '../../../../shared/components/dialogs/add-resource-tag-to-resource-dialog/add-resource-tag-to-resource-dialog.component';
import { CreateResourceTagDialogComponent } from '../../../../shared/components/dialogs/create-resource-tag-dialog/create-resource-tag-dialog.component';

@Component({
  selector: 'app-perun-web-apps-resource-tags',
  templateUrl: './resource-tags.component.html',
  styleUrls: ['./resource-tags.component.scss'],
})
export class ResourceTagsComponent implements OnInit {
  loading = false;
  resourceTags: ResourceTag[] = [];
  resource: Resource;
  selection = new SelectionModel<ResourceTag>(true, []);
  filterValue: string;
  tableId = TABLE_RESOURCES_TAGS;
  displayedColumns: string[] = [];
  createAuth: boolean;
  addAuth: boolean;
  removeAuth: boolean;

  constructor(
    private authResolver: GuiAuthResolver,
    private resourcesManager: ResourcesManagerService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private entityStorageService: EntityStorageService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resource = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.updateData();
  }

  removeTags(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      items: this.selection.selected.map((tag) => tag.tagName),
      title: 'RESOURCE_DETAIL.TAGS.REMOVE_TAGS_DIALOG_TITLE',
      description: 'RESOURCE_DETAIL.TAGS.REMOVE_TAGS_DIALOG_DESCRIPTION',
      theme: 'resource-theme',
      type: 'remove',
      showAsk: true,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resourcesManager
          .removeResourceTagsFromResource({
            resource: this.resource.id,
            resourceTags: this.selection.selected,
          })
          .subscribe(() => {
            this.notificator.showSuccess(
              this.translate.instant('RESOURCE_DETAIL.TAGS.REMOVED_SUCCESSFULLY'),
            );
            return this.updateData();
          });
      }
    });
  }

  addTag(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      voId: this.resource.voId,
      resourceId: this.resource.id,
      assignedTags: this.resourceTags,
      theme: 'resource-theme',
    };

    const dialogRef = this.dialog.open(AddResourceTagToResourceDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.notificator.showSuccess(
          this.translate.instant('RESOURCE_DETAIL.TAGS.ADDED_SUCCESSFULLY'),
        );
        this.updateData();
      }
    });
  }

  create(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { voId: this.resource.voId, theme: 'resource-theme' };

    const dialogRef = this.dialog.open(CreateResourceTagDialogComponent, config);

    dialogRef.afterClosed().subscribe((success: string) => {
      if (success) {
        this.notificator.showSuccess(
          this.translate.instant('VO_DETAIL.RESOURCES.TAGS.CREATE_SUCCESS'),
        );
        this.updateData();
      }
    });
  }

  updateData(): void {
    this.loading = true;
    this.selection.clear();
    this.resourcesManager.getAllResourcesTagsForResource(this.resource.id).subscribe((tags) => {
      this.resourceTags = tags;
      this.selection.clear();
      this.loading = false;
    });
  }

  setAuthRights(): void {
    const vo = {
      id: this.resource.voId,
      beanName: 'Vo',
    };

    this.displayedColumns = [];
    this.createAuth = this.authResolver.isAuthorized('createResourceTag_ResourceTag_Vo_policy', [
      vo,
    ]);
    this.addAuth = this.authResolver.isAuthorized(
      'assignResourceTagToResource_ResourceTag_Resource_policy',
      [this.resource],
    );
    this.removeAuth = this.authResolver.isAuthorized(
      'removeResourceTagFromResource_ResourceTag_Resource_policy',
      [this.resource],
    );
    this.displayedColumns = this.removeAuth ? ['select', 'id', 'name'] : ['id', 'name'];
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
