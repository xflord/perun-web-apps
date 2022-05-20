import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { CreateRelationDialogComponent } from '../../../../../shared/components/dialogs/create-relation-dialog/create-relation-dialog.component';
import { RemoveRelationDialogComponent } from '../../../../../shared/components/dialogs/remove-relation-dialog/remove-relation-dialog.component';
import { TABLE_GROUP_SETTINGS_RELATIONS } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { GroupsListComponent } from '@perun-web-apps/perun/components';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-group-settings-relations',
  templateUrl: './group-settings-relations.component.html',
  styleUrls: ['./group-settings-relations.component.scss'],
})
export class GroupSettingsRelationsComponent implements OnInit {
  @HostBinding('class.router-component') true;
  @ViewChild('list', {})
  list: GroupsListComponent;

  selection = new SelectionModel<Group>(true, []);
  groups: Group[] = [];
  group: Group;
  reverse = false;
  loading: boolean;
  filterValue = '';
  tableId = TABLE_GROUP_SETTINGS_RELATIONS;

  constructor(
    private groupService: GroupsManagerService,
    private dialog: MatDialog,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.group = this.entityStorageService.getEntity();
    this.refreshTable();
  }

  onCreate(): void {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      groups: this.groups,
      theme: 'group-theme',
      group: this.group,
      voId: this.group.voId,
      reverse: this.reverse,
    };

    const dialogRef = this.dialog.open(CreateRelationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onDelete(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      groups: this.selection.selected,
      theme: 'group-theme',
      groupId: this.group.id,
      reverse: this.reverse,
    };

    const dialogRef = this.dialog.open(RemoveRelationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.selection.clear();
    this.groupService.getGroupUnions(this.group.id, this.reverse).subscribe(
      (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  showReverseUnions(): void {
    this.reverse = !this.reverse;
    this.refreshTable();
  }
}
