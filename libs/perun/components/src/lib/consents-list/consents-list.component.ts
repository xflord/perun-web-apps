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
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { TableCheckbox } from '@perun-web-apps/perun/services';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Consent } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-consents-list',
  templateUrl: './consents-list.component.html',
  styleUrls: ['./consents-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ConsentsListComponent implements AfterViewInit, OnChanges {
  constructor(private tableCheckbox: TableCheckbox) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  @Input()
  consents: Consent[] = [];

  @Input()
  selection = new SelectionModel<Consent>(true, []);

  private sort: MatSort;

  @Input()
  displayedColumns: string[] = ['select', 'status', 'name'];
  expandedConsent: Consent | null;
  dataSource: MatTableDataSource<Consent>;

  @Input()
  filterValue = '';

  @Input()
  tableId: string;

  @Output()
  grantConsent: EventEmitter<number> = new EventEmitter();

  @Output()
  rejectConsent: EventEmitter<number> = new EventEmitter();

  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<Consent>(this.consents);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  getDataForColumn(data: Consent, column: string): string {
    switch (column) {
      case 'name':
        return data.consentHub.name;
      case 'status':
        return data.status;
      default:
        return '';
    }
  }

  exportData(format: string) {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        this.getDataForColumn,
        this
      ),
      format
    );
  }

  setDataSource() {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: Consent, filter: string) =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          this.getDataForColumn,
          this
        );
      this.dataSource.sortData = (data: Consent[], sort: MatSort) =>
        customDataSourceSort(data, sort, this.getDataForColumn, this);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelected(
      this.selection.selected.length,
      this.filterValue,
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.dataSource
    );
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(
      this.isAllSelected(),
      this.selection,
      this.filterValue,
      this.dataSource,
      this.sort,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      false
    );
  }
}
