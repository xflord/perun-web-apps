import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { Member, RichMember } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  parseEmail,
  parseFullName,
  parseLogins,
  parseOrganization,
  TABLE_ITEMS_COUNT_OPTIONS,
} from '@perun-web-apps/perun/utils';
import {
  ChangeMemberStatusDialogComponent,
  MemberTreeViewDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import { ActivatedRoute } from '@angular/router';
import { TableWrapperComponent } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss'],
})
export class MembersListComponent implements OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input() showGroupStatuses: boolean;
  @Input() members: RichMember[];
  @Input() searchString: string;
  @Input() selection: SelectionModel<RichMember> = new SelectionModel<RichMember>();
  @Input() displayedColumns: string[] = [
    'checkbox',
    'id',
    'voId',
    'userId',
    'type',
    'fullName',
    'status',
    'groupStatus',
    'sponsored',
    'organization',
    'email',
    'logins',
  ];
  @Input() disableStatusChange = false;
  @Input() disableExpirationChange = false;
  @Input() tableId: string;
  @Input() disableRouting = false;
  @Input() filter = '';
  @Output() updateTable = new EventEmitter<boolean>();

  dataSource: MatTableDataSource<RichMember>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  disabledRouting: boolean;
  groupId: number;

  private sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private tableCheckbox: TableCheckbox,
    private route: ActivatedRoute
  ) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  static getFilterDataForColumn(data: RichMember, column: string): string {
    switch (column) {
      case 'fullName':
        if (data.user) {
          return parseFullName(data.user);
        }
        return '';
      case 'email':
        return parseEmail(data);
      case 'logins':
        return parseLogins(data);
      default:
        return '';
    }
  }

  static getExportDataForColumn(
    data: RichMember,
    column: string,
    showGroupStatuses: boolean
  ): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'fullName':
        if (data.user) {
          return parseFullName(data.user);
        }
        return '';
      case 'status':
        return showGroupStatuses ? data.groupStatus : data.status;
      case 'organization':
        return parseOrganization(data);
      case 'email':
        return parseEmail(data);
      case 'logins':
        return parseLogins(data);
      default:
        return '';
    }
  }

  static getSortDataForColumn(
    data: RichMember,
    column: string,
    showGroupStatuses: boolean
  ): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'fullName':
        if (data.user) {
          return data.user.lastName ? data.user.lastName : data.user.firstName ?? '';
        }
        return '';
      case 'status':
        return showGroupStatuses ? data.groupStatus : data.status;
      case 'organization':
        return parseOrganization(data);
      case 'email':
        return parseEmail(data);
      default:
        return '';
    }
  }

  getExportDataForColumnFun = (data: RichMember, column: string): string => {
    return MembersListComponent.getExportDataForColumn(data, column, this.showGroupStatuses);
  };

  getSortDataForColumnFun = (data: RichMember, column: string): string => {
    return MembersListComponent.getSortDataForColumn(data, column, this.showGroupStatuses);
  };

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        this.getExportDataForColumnFun
      ),
      format
    );
  }

  setDataSource(): void {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<RichMember>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filterPredicate = (data: RichMember, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          MembersListComponent.getFilterDataForColumn
        );
      this.dataSource.sortData = (data: RichMember[], sort: MatSort): RichMember[] =>
        customDataSourceSort(data, sort, this.getSortDataForColumnFun);
    }
    this.dataSource.filter = this.filter;
    this.dataSource.data = this.members;
  }

  ngAfterViewInit(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
  }

  ngOnChanges(): void {
    this.setDataSource();
    this.disabledRouting = this.disableRouting;
    this.route.parent?.params.subscribe((params) => {
      if (params['groupId']) {
        this.groupId = Number(params['groupId']);
      }
    });
  }

  canBeSelected = (member: RichMember): boolean => member.membershipType === 'DIRECT';

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
  }

  checkboxLabel(row?: RichMember): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  changeStatus(event: Event, member: RichMember): void {
    event.stopPropagation();
    if (!this.disableStatusChange) {
      const config = getDefaultDialogConfig();
      config.width = '500px';
      config.data = { member: member, disableChangeExpiration: this.disableExpirationChange };

      const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
      dialogRef.afterClosed().subscribe((success: Member) => {
        if (success) {
          this.updateTable.emit(true);
        }
      });
    }
  }

  viewMemberGroupTree(member: RichMember): void {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = { member: member, groupId: this.groupId };

    this.dialog.open(MemberTreeViewDialogComponent, config);
  }
}
