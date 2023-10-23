import { ChangeDetectionStrategy, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupDialogComponent } from '../../../../shared/components/dialogs/create-group-dialog/create-group-dialog.component';
import { DeleteGroupDialogComponent } from '../../../../shared/components/dialogs/delete-group-dialog/delete-group-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MoveGroupDialogComponent } from '../../../../shared/components/dialogs/move-group-dialog/move-group-dialog.component';
import {
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
} from '@perun-web-apps/perun/utils';
import {
  Group,
  GroupAdminRoles,
  GroupsManagerService,
  GroupsOrderColumn,
  PaginatedRichGroups,
  RichGroup,
  RoleAssignmentType,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { GroupFlatNode, GroupWithStatus, PageQuery } from '@perun-web-apps/perun/models';
import { TABLE_VO_GROUPS } from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { GroupUtilsService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-groups',
  templateUrl: './vo-groups.component.html',
  styleUrls: ['./vo-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoGroupsComponent implements OnInit {
  static id = 'VoGroupsComponent';
  @HostBinding('class.router-component') true;
  @ViewChild('toggle', { static: true }) toggle: MatSlideToggle;
  vo: Vo;
  groups: RichGroup[] = [];
  nextPage = new BehaviorSubject<PageQuery>({});
  groupPage$: Observable<PaginatedRichGroups> = this.nextPage.pipe(
    switchMap((pageQuery) =>
      this.groupService.getGroupsPage({
        vo: this.vo.id,
        attrNames: this.attrNames,
        query: {
          order: pageQuery.order,
          pageSize: pageQuery.pageSize,
          offset: pageQuery.offset,
          searchString: pageQuery.searchString,
          sortColumn: pageQuery.sortColumn as GroupsOrderColumn,
          roles: this.selectedRoles,
          types: this.selectedRoleTypes,
        },
      }),
    ),
    // 'Tapping' is generally a last resort
    tap((page) => {
      this.groups = page.data;
      this.setAuthRights();
      this.selected.clear();
      setTimeout(() => this.loadingSubject$.next(false), 200);
    }),
    startWith({ data: [], totalCount: 0, offset: 0, pageSize: 0 }),
  );

  showGroupList = false;
  selected = new SelectionModel<RichGroup>(true, []);
  loadingSubject$ = new BehaviorSubject(false);
  loading$: Observable<boolean> = merge(
    this.loadingSubject$,
    this.nextPage.pipe(map((): boolean => true)),
  );
  filtering = false;
  filterValue = '';
  tableId = TABLE_VO_GROUPS;
  displayedColumns = ['select', 'id', 'name', 'description', 'menu'];
  selectedRoles: GroupAdminRoles[] = [];
  selectedRoleTypes: RoleAssignmentType[] = [];
  createAuth: boolean;
  routeAuth: boolean;
  removeAuth$: Observable<boolean> = this.selected.changed.pipe(
    map((change) =>
      change.source.selected.reduce(
        (acc, grp) =>
          acc && this.authResolver.isAuthorized('deleteGroup_Group_boolean_policy', [this.vo, grp]),
        true,
      ),
    ),
    startWith(true),
  );

  private attrNames = [
    Urns.GROUP_SYNC_ENABLED,
    Urns.GROUP_LAST_SYNC_STATE,
    Urns.GROUP_LAST_SYNC_TIMESTAMP,
    Urns.GROUP_STRUCTURE_SYNC_ENABLED,
    Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
    Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP,
  ];

  constructor(
    private dialog: MatDialog,
    private groupService: GroupsManagerService,
    public authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private groupUtils: GroupUtilsService,
  ) {}

  onCreateGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { voId: this.vo.id, parentGroup: null, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(CreateGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe((groupCreated) => {
      if (groupCreated) {
        this.refresh();
      }
    });
  }

  ngOnInit(): void {
    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();

    if (localStorage.getItem('preferedValue') === 'list') {
      this.toggle.toggle();
      this.showGroupList = true;
    } else {
      this.refresh();
    }

    this.toggle.change.subscribe(() => {
      const value = this.toggle.checked ? 'list' : 'tree';
      localStorage.setItem('preferedValue', value);
      this.refresh();
    });
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

  deleteGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { voId: this.vo.id, groups: this.selected.selected, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(DeleteGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    });
  }

  labelToggle(): void {
    this.showGroupList = !this.showGroupList;
    this.refresh();
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
        this.refresh();
      }
    });
  }

  loadAllGroups(): void {
    this.groupService
      .getAllRichGroupsWithAttributesByNames(
        this.vo.id,
        this.attrNames,
        this.selectedRoles,
        this.selectedRoleTypes,
      )
      .subscribe((groups) => {
        this.groups = groups;
        this.selected.clear();
        this.setAuthRights();
        this.loadingSubject$.next(false);
      });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.filtering = filterValue !== '';
  }

  applyRoles(roles: GroupAdminRoles[]): void {
    this.selectedRoles = roles;
    this.refresh();
  }

  applyRoleTypes(types: RoleAssignmentType[]): void {
    this.selectedRoleTypes = types;
    this.refresh();
  }

  refresh(): void {
    this.loadingSubject$.next(true);
    if (this.showGroupList) {
      this.nextPage.next(this.nextPage.value);
    } else {
      this.loadAllGroups();
    }
  }

  downloadAll(a: { format: string; length: number }): void {
    const query = this.nextPage.getValue();
    const getDataForCol = (data: GroupWithStatus, column: string): string => {
      return this.groupUtils.getDataForColumn(data, column);
    };

    this.groupService
      .getGroupsPage({
        vo: this.vo.id,
        attrNames: this.attrNames,
        query: {
          order: query.order,
          pageSize: a.length,
          offset: 0,
          searchString: query.searchString,
          sortColumn: query.sortColumn as GroupsOrderColumn,
          roles: this.selectedRoles,
          types: this.selectedRoleTypes,
        },
      })
      .subscribe({
        next: (paginatedGroups) => {
          downloadData(
            getDataForExport(paginatedGroups.data, this.displayedColumns, getDataForCol),
            a.format,
          );
        },
      });
  }
}
