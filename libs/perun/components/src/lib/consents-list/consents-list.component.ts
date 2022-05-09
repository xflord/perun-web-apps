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
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input() filterValue = '';
  @Input() tableId: string;
  @Input() consents: Consent[] = [];
  @Input() selection = new SelectionModel<Consent>(true, []);
  @Input() displayedColumns: string[] = ['select', 'status', 'name'];
  @Output() grantConsent: EventEmitter<number> = new EventEmitter<number>();
  @Output() rejectConsent: EventEmitter<number> = new EventEmitter<number>();
  expandedConsent: Consent | null;
  dataSource: MatTableDataSource<Consent>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  private sort: MatSort;

  constructor(private tableCheckbox: TableCheckbox) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getDataForColumn(data: Consent, column: string): string {
    switch (column) {
      case 'name':
        return data.consentHub.name;
      case 'status':
        return data.status;
      default:
        return '';
    }
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<Consent>(this.consents);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        ConsentsListComponent.getDataForColumn
      ),
      format
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: Consent, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          ConsentsListComponent.getDataForColumn
        );
      this.dataSource.sortData = (data: Consent[], sort: MatSort): Consent[] =>
        customDataSourceSort(data, sort, ConsentsListComponent.getDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelected(
      this.selection.selected.length,
      this.filterValue,
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.dataSource
    );
  }

  masterToggle(): void {
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
