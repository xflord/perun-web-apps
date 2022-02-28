import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupDialogComponent } from '../../../../shared/components/dialogs/create-group-dialog/create-group-dialog.component';
import { DeleteGroupDialogComponent } from '../../../../shared/components/dialogs/delete-group-dialog/delete-group-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MoveGroupDialogComponent } from '../../../../shared/components/dialogs/move-group-dialog/move-group-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Group, GroupsManagerService, RichGroup, Vo } from '@perun-web-apps/perun/openapi';
import { GroupFlatNode } from '@perun-web-apps/perun/models';
import { TABLE_VO_GROUPS } from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GroupsListComponent, GroupsTreeComponent } from '@perun-web-apps/perun/components';

@Component({
  selector: 'app-vo-groups',
  templateUrl: './vo-groups.component.html',
  styleUrls: ['./vo-groups.component.scss'],
})
export class VoGroupsComponent implements OnInit {
  static id = 'VoGroupsComponent';
  @HostBinding('class.router-component') true;
  @ViewChild('toggle', { static: true })
  toggle: MatSlideToggle;
  @ViewChild('tree', {})
  tree: GroupsTreeComponent;
  @ViewChild('list', {})
  list: GroupsListComponent;
  vo: Vo;
  groups: RichGroup[] = [];
  showGroupList = false;
  selected = new SelectionModel<RichGroup>(true, []);
  loading: boolean;
  filtering = false;
  filterValue = '';
  tableId = TABLE_VO_GROUPS;

  createAuth: boolean;
  routeAuth: boolean;

  constructor(
    private dialog: MatDialog,
    private groupService: GroupsManagerService,
    public authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  onCreateGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { voId: this.vo.id, parentGroup: null, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(CreateGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe((groupCreated) => {
      if (groupCreated) {
        this.loading = true;
        this.loadAllGroups();
      }
    });
  }

  ngOnInit(): void {
    this.loading = true;
    if (localStorage.getItem('preferedValue') === 'list') {
      this.toggle.toggle();
      this.selected.clear();
      this.showGroupList = true;
    }
    this.toggle.change.subscribe(() => {
      const value = this.toggle.checked ? 'list' : 'tree';
      localStorage.setItem('preferedValue', value);
      this.loadAllGroups();
    });

    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.loadAllGroups();
  }

  setAuthRights(): void {
    this.createAuth = this.authResolver.isAuthorized('createGroup_Vo_Group_policy', [this.vo]);

    if (this.groups.length !== 0) {
      this.routeAuth = this.authResolver.isAuthorized('getGroupById_int_policy', [
        this.vo,
        this.groups[0],
      ]);
    }
  }

  disableRemove(): boolean {
    return (
      (this.tree !== undefined && !this.tree.removeAuth) ||
      (this.list !== undefined && !this.list.removeAuth)
    );
  }

  disableTooltip(): boolean {
    return this.tree?.removeAuth || this.list?.removeAuth;
  }

  deleteGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { voId: this.vo.id, groups: this.selected.selected, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(DeleteGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAllGroups();
      }
    });
  }

  removeAllGroups(): void {
    this.selected.clear();
  }

  onMoveGroup(group: GroupFlatNode | Group): void {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      group: group,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(MoveGroupDialogComponent, config);
    dialogRef.afterClosed().subscribe((groupMoved) => {
      if (groupMoved) {
        this.loadAllGroups();
      }
    });
  }

  loadAllGroups(): void {
    this.loading = true;
    this.groupService
      .getAllRichGroupsWithAttributesByNames(this.vo.id, [
        Urns.GROUP_SYNC_ENABLED,
        Urns.GROUP_LAST_SYNC_STATE,
        Urns.GROUP_LAST_SYNC_TIMESTAMP,
        Urns.GROUP_STRUCTURE_SYNC_ENABLED,
        Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
        Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP,
      ])
      .subscribe((groups) => {
        this.groups = groups;
        this.selected.clear();
        this.setAuthRights();
        this.loading = false;
      });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.filtering = filterValue !== '';
  }
}
