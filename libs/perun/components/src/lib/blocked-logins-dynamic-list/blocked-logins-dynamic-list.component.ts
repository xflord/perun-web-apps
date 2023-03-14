import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { GlobalNamespacePipe } from '@perun-web-apps/perun/pipes';
import { merge, Observable } from 'rxjs';
import {
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import {
  DynamicDataSource,
  DynamicPaginatingService,
  GuiAuthResolver,
} from '@perun-web-apps/perun/services';
import { BlockedLogin } from '@perun-web-apps/perun/openapi';
import { tap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import { ExportDataDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-blocked-logins-dynamic-list',
  templateUrl: './blocked-logins-dynamic-list.component.html',
  styleUrls: ['./blocked-logins-dynamic-list.component.scss'],
  providers: [GlobalNamespacePipe],
})
export class BlockedLoginsDynamicListComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @ViewChild(MatSort) sort: MatSort;

  @Input() tableId: string;
  @Input() updateTable: boolean;
  @Input() searchString = '';
  @Input() selection = new SelectionModel<BlockedLogin>(true, []);
  @Input() selectedNamespaces: string[] = [];

  @Output() loading$: EventEmitter<Observable<boolean>> = new EventEmitter<Observable<boolean>>();

  displayedColumns = ['checkbox', 'login', 'namespace'];
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  dataSource: DynamicDataSource<BlockedLogin>;

  constructor(
    private authResolver: GuiAuthResolver,
    private tableConfigService: TableConfigService,
    private dynamicPaginatingService: DynamicPaginatingService,
    private globalNamespacePipe: GlobalNamespacePipe,
    private dialog: MatDialog
  ) {}

  getExportDataForColumn(data: BlockedLogin, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'login':
        return data.login;
      case 'namespace':
        return this.globalNamespacePipe.transform(data.namespace);
      default:
        return '';
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.child.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.child.paginator.page)
      .pipe(tap(() => this.loadBlockedLoginsPage()))
      .subscribe();
  }

  ngOnChanges(): void {
    if (this.dataSource) {
      this.child.paginator.pageIndex = 0;
      this.loadBlockedLoginsPage();
    }
  }

  ngOnInit(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }

    this.dataSource = new DynamicDataSource<BlockedLogin>(
      this.dynamicPaginatingService,
      this.authResolver
    );

    this.dataSource.loadBlockedLogins(
      this.tableConfigService.getTablePageSize(this.tableId),
      0,
      'ASCENDING',
      'LOGIN',
      this.searchString,
      this.selectedNamespaces
    );

    this.loading$.emit(this.dataSource.loading$);
  }

  loadBlockedLoginsPage(): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'login' ? 'LOGIN' : 'NAMESPACE';

    this.dataSource.loadBlockedLogins(
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      sortDirection,
      sortColumn,
      this.searchString,
      this.selectedNamespaces
    );
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

  exportAllData(format: string): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'login' ? 'LOGIN' : 'NAMESPACE';

    const config = getDefaultDialogConfig();
    config.width = '300px';
    const exportLoading = this.dialog.open(ExportDataDialogComponent, config);

    this.dataSource
      .getAllBlockedLogins(
        sortDirection,
        this.child.paginator.length,
        sortColumn,
        this.searchString,
        this.selectedNamespaces
      )
      .subscribe((response) => {
        exportLoading.close();
        downloadData(
          getDataForExport(response, this.displayedColumns, (data, column) =>
            this.getExportDataForColumn(data, column)
          ),
          format
        );
      });
  }

  exportDisplayedData(format: string): void {
    downloadData(
      getDataForExport(this.dataSource.getData(), this.displayedColumns, (data, column) =>
        this.getExportDataForColumn(data, column)
      ),
      format
    );
  }
}
