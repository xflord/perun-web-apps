import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { RichUser } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  parseFullName,
  parseLogins,
  parseUserEmail,
  parseVo,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, StoreService, TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnChanges {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input()
  users: RichUser[];
  @Input()
  selection = new SelectionModel<RichUser>(true, []);
  @Input()
  displayedColumns: string[] = ['select', 'user', 'id', 'name', 'email', 'logins', 'organization'];
  @Input()
  routeToAdmin = true;
  @Input()
  disableRouting = false;
  @Input()
  filter = '';
  @Input()
  tableId: string;
  @Input()
  noUsersFoundLabel: string;
  @Input()
  disableSelf = false;
  @Input() directAdmins: number[] = null;

  svgIcon = 'perun-service-identity-black';
  dataSource: MatTableDataSource<RichUser>;
  principalId: number;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  disabledRouting = false;
  private sort: MatSort;

  constructor(
    public authResolver: GuiAuthResolver,
    private tableCheckbox: TableCheckbox,
    private storeService: StoreService,
  ) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  static getDataForColumn(data: RichUser, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'user':
        return data.serviceUser ? 'true' : 'false';
      case 'name':
        if (data) {
          return data.lastName ? data.lastName : data.firstName ?? '';
        }
        return '';
      case 'organization':
        return parseVo(data);
      case 'email':
        return parseUserEmail(data);
      case 'logins':
        return parseLogins(data);
      default:
        return '';
    }
  }

  static getExportDataForColumn(data: RichUser, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'user':
        return data.serviceUser ? 'service-user' : 'user';
      case 'name':
        if (data) {
          return parseFullName(data);
        }
        return '';
      case 'organization':
        return parseVo(data);
      case 'email':
        return parseUserEmail(data);
      case 'logins':
        return parseLogins(data);
      default:
        return '';
    }
  }

  canBeSelected = (row: RichUser): boolean =>
    this.directAdmins === null || this.directAdmins.includes(row.id);

  exportAllData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        UsersListComponent.getExportDataForColumn,
      ),
      format,
    );
  }

  exportDisplayedData(format: string): void {
    const start = this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize;
    const end = start + this.dataSource.paginator.pageSize;
    downloadData(
      getDataForExport(
        this.dataSource
          .sortData(this.dataSource.filteredData, this.dataSource.sort)
          .slice(start, end),
        this.displayedColumns,
        UsersListComponent.getExportDataForColumn,
      ),
      format,
    );
  }

  setDataSource(): void {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<RichUser>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filterPredicate = (data: RichUser, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          UsersListComponent.getDataForColumn,
        );
      this.dataSource.sortData = (data: RichUser[], sort: MatSort): RichUser[] =>
        customDataSourceSort(data, sort, UsersListComponent.getDataForColumn);
    }
    this.dataSource.filter = this.filter;
    this.dataSource.data = this.users;
  }

  ngOnChanges(): void {
    this.principalId = this.storeService.getPerunPrincipal().userId;
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    this.setDataSource();
  }

  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelected(
      this.selection.selected.length,
      this.dataSource,
      this.canBeSelected,
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
      this.canBeSelected,
    );
  }
}
