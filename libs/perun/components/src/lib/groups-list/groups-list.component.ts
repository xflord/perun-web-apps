import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ChangeGroupExpirationDialogComponent,
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions,
  GroupSyncDetailDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import { Group, Member, RichGroup, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import {
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  getGroupExpiration,
  parseDate,
  isGroupSynchronized,
} from '@perun-web-apps/perun/utils';

import { GroupWithStatus } from '@perun-web-apps/perun/models';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';

@Component({
  selector: 'perun-web-apps-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss'],
})
export class GroupsListComponent implements AfterViewInit, OnChanges {
  @Input() theme = 'group-theme';
  @Output() moveGroup = new EventEmitter<GroupWithStatus>();
  @Input() groups: GroupWithStatus[] = [];
  @Input() selection = new SelectionModel<GroupWithStatus>(true, []);
  @Input() displayedColumns: string[] = [
    'select',
    'id',
    'recent',
    'vo',
    'indirectGroupAssigment',
    'name',
    'status',
    'groupStatus',
    'description',
    'expiration',
    'menu',
  ];
  @Input() disableMembers: boolean;
  @Input() disableGroups: boolean;
  @Input() groupsToDisableCheckbox: Set<number> = new Set<number>();
  @Input() groupsToDisableRouting: Set<number> = new Set<number>();
  @Input() filter = '';
  @Input() disableHeadCheckbox: boolean;
  @Input() parentGroup: Group;
  @Input() disableRouting = false;
  @Input() authType: string;
  @Input() memberId: number;
  @Input() memberGroupStatus: string;
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input() recentIds: number[] = [];
  @Input() resourceId: number = null;
  @Input() tableId: string;
  @Input() noGroupsAlert = 'SHARED_LIB.UI.ALERTS.NO_GROUPS';
  @Output() refreshTable = new EventEmitter<void>();
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  displayButtons = window.innerWidth > 800;
  dataSource: MatTableDataSource<GroupWithStatus>;
  disabledRouting = false;
  vo: Vo;
  voIds: Set<number> = new Set<number>();
  voNames: Map<number, string> = new Map<number, string>();
  removeAuth: boolean;

  private sort: MatSort;
  private hasMembersGroup = false;

  constructor(
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private voService: VosManagerService,
    private tableCheckbox: TableCheckbox,
    private changeDetector: ChangeDetectorRef
  ) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  static getDataForColumn(
    data: GroupWithStatus,
    column: string,
    voNames: Map<number, string>
  ): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return voNames.get(data.voId);
      case 'name':
        return data.name;
      case 'description':
        return data.description;
      case 'expiration': {
        const expirationStr = getGroupExpiration(data);
        return parseDate(expirationStr);
      }
      case 'recent':
        return '';
      case 'status':
        return data.status;
      case 'uuid':
        return data.uuid;
      default:
        return data[column] as string;
    }
  }

  static getSortDataForColumn(
    data: GroupWithStatus,
    column: string,
    voNames: Map<number, string>,
    recentIds: number[]
  ): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return voNames.get(data.voId);
      case 'name':
        return data.name;
      case 'description':
        return data.description;
      case 'expiration': {
        const expirationStr = getGroupExpiration(data);
        if (!expirationStr || expirationStr.toLowerCase() === 'never') {
          return expirationStr;
        }
        return formatDate(expirationStr, 'yyyy.MM.dd', 'en');
      }
      case 'recent':
        if (recentIds) {
          if (recentIds.includes(data.id)) {
            return '#'.repeat(recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      case 'status':
        return data.status;
      default:
        return data[column] as string;
    }
  }

  @HostListener('window:resize', ['$event'])
  shouldHideButtons(): void {
    this.displayButtons = window.innerWidth > 800;
  }

  getDataForColumnFun = (data: GroupWithStatus, column: string): string => {
    return GroupsListComponent.getDataForColumn(data, column, this.voNames);
  };

  getSortDataForColumnFun = (data: GroupWithStatus, column: string): string => {
    return GroupsListComponent.getSortDataForColumn(data, column, this.voNames, this.recentIds);
  };

  ngOnChanges(): void {
    this.disabledRouting = this.disableRouting;
    this.hasMembersGroup = this.checkIfHasMembersGroup();
    this.updateVoNames();
    this.setDataSource();
    if (this.authType) {
      this.removeAuth = this.setAuth();
    }
  }

  checkIfHasMembersGroup(): boolean {
    for (const group of this.groups) {
      if (group.name === 'members') {
        return true;
      }
    }
    return false;
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        this.getDataForColumnFun
      ),
      format
    );
  }

  setDataSource(): void {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<GroupWithStatus>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filterPredicate = (data: Group | RichGroup, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          this.getDataForColumnFun,
          true
        );
      this.dataSource.sortData = (
        data: Group[] | RichGroup[],
        sort: MatSort
      ): Group[] | RichGroup[] => customDataSourceSort(data, sort, this.getSortDataForColumnFun);
    }
    this.dataSource.filter = this.filter;
    this.dataSource.data = this.groups;
  }

  canBeSelected = (group: GroupWithStatus): boolean =>
    (group.name !== 'members' || !this.disableMembers) && !this.disableSelect(group);

  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelectedWithDisabledCheckbox(
      this.selection.selected.length,
      this.filter,
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.child.paginator.pageIndex,
      this.dataSource,
      this.sort,
      this.canBeSelected
    );
  }

  masterToggle(): void {
    this.tableCheckbox.masterToggle(
      this.isAllSelected(),
      this.selection,
      this.filter,
      this.dataSource,
      this.sort,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      true,
      this.canBeSelected
    );

    if (this.authType) {
      this.removeAuth = this.setAuth();
    }
  }

  checkboxLabel(row?: GroupWithStatus): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  disableSelect(grp: GroupWithStatus): boolean {
    return (
      this.disableGroups && (this.groupsToDisableCheckbox.has(grp.id) || isGroupSynchronized(grp))
    );
  }

  ngAfterViewInit(): void {
    if (this.vo === undefined && this.groups.length !== 0) {
      this.vo = {
        id: this.groups[0].voId,
        beanName: 'Vo',
      };
    }
    this.shouldHideButtons();
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
      this.changeDetector.detectChanges();
    }
  }

  onMoveGroup(group: GroupWithStatus): void {
    this.moveGroup.emit(group);
  }

  onSyncDetail(rg: RichGroup): void {
    const config = getDefaultDialogConfig();
    config.data = {
      groupId: rg.id,
      theme: this.theme,
    };
    this.dialog.open(GroupSyncDetailDialogComponent, config);
  }

  onChangeNameDescription(rg: RichGroup): void {
    const config = getDefaultDialogConfig();
    config.data = {
      theme: 'group-theme',
      group: rg,
      dialogType: EditFacilityResourceGroupVoDialogOptions.GROUP,
    };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.refreshTable.emit();
      }
    });
  }

  setAuth(): boolean {
    if (this.authType === 'group-subgroups') {
      return this.selection.selected.reduce(
        (acc, grp) =>
          acc && this.authResolver.isAuthorized('deleteGroup_Group_boolean_policy', [grp]),
        true
      );
    } else if (this.authType === 'group-relations') {
      return this.selection.selected.reduce(
        (acc, grp) =>
          acc &&
          this.authResolver.isAuthorized('result-removeGroupUnion_Group_Group_policy', [
            this.parentGroup,
          ]) &&
          this.authResolver.isAuthorized('operand-removeGroupUnion_Group_Group_policy', [grp]),
        true
      );
    } else if (this.authType === 'vo-groups') {
      return this.selection.selected.reduce(
        (acc, grp) =>
          acc && this.authResolver.isAuthorized('deleteGroup_Group_boolean_policy', [this.vo, grp]),
        true
      );
    } else if (this.authType === 'member-groups') {
      return this.selection.selected.reduce(
        (acc, grp) =>
          acc && this.authResolver.isAuthorized('removeMember_Member_List<Group>_policy', [grp]),
        true
      );
    } else if (this.authType === 'application-form-manage-groups') {
      return this.selection.selected.reduce(
        (acc, grp) =>
          acc &&
          this.authResolver.isAuthorized('deleteGroupsFromAutoRegistration_List<Group>_policy', [
            this.vo,
            grp,
          ]),
        true
      );
    }
  }

  itemSelectionToggle(item: GroupWithStatus): void {
    this.selection.toggle(item);
    this.removeAuth = this.setAuth();
  }

  getCheckboxTooltipMessage(row: GroupWithStatus): string {
    if (this.authType === 'create-relation-dialog') {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.CREATE_RELATION_AUTH_TOOLTIP';
    } else if (isGroupSynchronized(row)) {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.SYNCHRONIZED_GROUP';
    } else if (row.sourceGroupId) {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.INDIRECT_GROUP';
    } else {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.ALREADY_MEMBER_TOOLTIP';
    }
  }

  updateVoNames(): void {
    if (this.displayedColumns.includes('vo')) {
      this.groups.forEach((grp) => {
        if (!this.voIds.has(grp.voId)) {
          this.voIds.add(grp.voId);
        }
      });
      if (this.voIds.size > 0) {
        this.voService.getVosByIds([...this.voIds]).subscribe((vos) => {
          vos.forEach((vo) => {
            this.voNames.set(vo.id, vo.name);
          });
        });
      }
    }
  }

  changeExpiration(group: GroupWithStatus): void {
    const expirationAtt = group.attributes.find(
      (att) => att.baseFriendlyName === 'groupMembershipExpiration'
    );
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      memberId: this.memberId,
      groupId: group.id,
      expirationAttr: expirationAtt,
      status: this.getStatusAttribute(group),
    };

    const dialogRef = this.dialog.open(ChangeGroupExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe((success: { success: boolean; member: Member }) => {
      if (success.success) {
        this.refreshTable.emit();
      }
    });
  }

  canManageGroup(group: GroupWithStatus): boolean {
    return (
      this.authResolver.isThisGroupAdmin(group.id) || this.authResolver.isThisVoAdmin(group.voId)
    );
  }

  getStatusAttribute(grp: RichGroup): string {
    const filter = grp.attributes.find((att) => att.baseFriendlyName === 'groupStatus');
    return filter?.value ? (filter.value as string) : '';
  }
}
