import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { RichUser } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  parseFullName,
  parseLogins,
  parseUserEmail,
  parseVo,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import {
  DynamicDataSource,
  DynamicPaginatingService,
  GuiAuthResolver,
  TableCheckbox,
} from '@perun-web-apps/perun/services';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { ExportDataDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'perun-web-apps-users-dynamic-list',
  templateUrl: './users-dynamic-list.component.html',
  styleUrls: ['./users-dynamic-list.component.css'],
})
export class UsersDynamicListComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @ViewChild(MatSort) sort: MatSort;
  @Input() selection = new SelectionModel<RichUser>(true, []);
  @Input() displayedColumns: string[] = [
    'select',
    'user',
    'id',
    'name',
    'email',
    'logins',
    'organization',
  ];
  @Input() tableId: string;
  @Input() disableRouting = false;
  @Input() searchString = '';
  @Input() attrNames: string[] = [];
  @Input() withoutVo: boolean;
  @Input() updateTable: boolean;
  @Input() facilityId: number;
  @Input() voId: number;
  @Input() resourceId: number;
  @Input() serviceId: number;
  @Input() onlyAllowed: boolean;

  dataSource: DynamicDataSource<RichUser>;
  svgIcon = 'perun-service-identity-black';
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  constructor(
    private authResolver: GuiAuthResolver,
    private tableCheckbox: TableCheckbox,
    private tableConfigService: TableConfigService,
    private dynamicPaginatingService: DynamicPaginatingService,
    private dialog: MatDialog
  ) {}

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

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.child.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.child.paginator.page)
      .pipe(tap(() => this.loadUsersPage()))
      .subscribe();
  }

  ngOnInit(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }

    this.dataSource = new DynamicDataSource<RichUser>(
      this.dynamicPaginatingService,
      this.authResolver
    );
    this.dataSource.loadUsers(
      this.attrNames,
      this.tableConfigService.getTablePageSize(this.tableId),
      0,
      'ASCENDING',
      'NAME',
      this.searchString,
      this.withoutVo,
      this.facilityId,
      this.voId,
      this.resourceId,
      this.serviceId,
      this.onlyAllowed
    );
  }

  ngOnChanges(): void {
    if (this.dataSource) {
      this.child.paginator.pageIndex = 0;
      this.loadUsersPage();
    }
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.getData().forEach((row) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().length;
    return numSelected === numRows;
  }

  loadUsersPage(): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'name' ? 'NAME' : 'ID';
    this.dataSource.loadUsers(
      this.attrNames,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      sortDirection,
      sortColumn,
      this.searchString,
      this.withoutVo,
      this.facilityId,
      this.voId,
      this.resourceId,
      this.serviceId,
      this.onlyAllowed
    );
  }

  exportDisplayedData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.getData(),
        this.displayedColumns,
        UsersDynamicListComponent.getExportDataForColumn
      ),
      format
    );
  }

  exportAllData(format: string): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'name' ? 'NAME' : 'ID';

    const config = getDefaultDialogConfig();
    config.width = '300px';
    const exportLoading = this.dialog.open(ExportDataDialogComponent, config);

    this.dataSource
      .getAllUsers(
        this.attrNames,
        sortDirection,
        this.child.paginator.length,
        sortColumn,
        this.searchString,
        this.withoutVo,
        this.facilityId,
        this.voId,
        this.resourceId,
        this.serviceId,
        this.onlyAllowed
      )
      .subscribe((response) => {
        exportLoading.close();
        downloadData(
          getDataForExport(
            response,
            this.displayedColumns,
            UsersDynamicListComponent.getExportDataForColumn
          ),
          format
        );
      });
  }
}
