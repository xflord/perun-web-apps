import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TABLE_ADD_RESOURCES_TAGS_TO_RESOURCE } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { ResourcesManagerService, ResourceTag } from '@perun-web-apps/perun/openapi';

export interface AddResourceTagToResourceDialogData {
  theme: string;
  voId: number;
  resourceId: number;
  assignedTags: ResourceTag[];
}

@Component({
  selector: 'app-add-resource-tag-to-resource-dialog',
  templateUrl: './add-resource-tag-to-resource-dialog.component.html',
  styleUrls: ['./add-resource-tag-to-resource-dialog.component.scss'],
})
export class AddResourceTagToResourceDialogComponent implements OnInit {
  loading: boolean;
  theme: string;
  tableId = TABLE_ADD_RESOURCES_TAGS_TO_RESOURCE;
  filterValue: string;
  selection = new SelectionModel<ResourceTag>(true, []);
  resourceTags: ResourceTag[] = [];
  displayedColumns = ['select', 'id', 'name'];

  private voId: number;
  private resourceId: number;
  private assignedTags: ResourceTag[];

  constructor(
    private dialogRef: MatDialogRef<AddResourceTagToResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddResourceTagToResourceDialogData,
    private resourcesManager: ResourcesManagerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.voId = this.data.voId;
    this.resourceId = this.data.resourceId;
    this.assignedTags = this.data.assignedTags;
    this.resourcesManager.getAllResourcesTagsForVo(this.voId).subscribe((tags) => {
      this.resourceTags = tags.filter(
        (tag) => !this.assignedTags.map((assignedTag) => assignedTag.id).includes(tag.id)
      );
      this.loading = false;
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(resourceTags: ResourceTag[]): void {
    if (resourceTags.length === 0) {
      return this.dialogRef.close(true);
    }
    const tag = resourceTags.pop();
    this.resourcesManager
      .assignResourceTagToResource({
        resource: this.resourceId,
        resourceTag: tag,
      })
      .subscribe(() => {
        this.onSubmit(resourceTags);
      });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
