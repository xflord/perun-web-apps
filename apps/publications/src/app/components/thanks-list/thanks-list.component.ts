import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { Owner, ThanksForGUI } from '@perun-web-apps/perun/openapi';
import { MatSort } from '@angular/material/sort';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-thanks-list',
  templateUrl: './thanks-list.component.html',
  styleUrls: ['./thanks-list.component.scss'],
})
export class ThanksListComponent implements AfterViewInit, OnChanges {
  @Input() thanks: ThanksForGUI[] = [];
  @Input() filterValue = '';
  @Input() tableId: string;
  @Input() displayedColumns = ['select', 'id', 'name', 'createdBy'];
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input() selection = new SelectionModel<Owner>(true, []);
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  dataSource: MatTableDataSource<ThanksForGUI>;
  private sort: MatSort;

  constructor(private tableCheckbox: TableCheckbox) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getDataForColumn(data: ThanksForGUI, column: string): string {
    switch (column) {
      case 'id':
        return data.ownerId.toString();
      case 'name':
        return data.ownerName;
      default:
        return data[column] as string;
    }
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<ThanksForGUI>(this.thanks);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
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

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        ThanksListComponent.getDataForColumn
      ),
      format
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

  checkboxLabel(row?: Owner): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  private setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: ThanksForGUI, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          ThanksListComponent.getDataForColumn
        );
      this.dataSource.sortData = (data: ThanksForGUI[], sort: MatSort): ThanksForGUI[] =>
        customDataSourceSort(data, sort, ThanksListComponent.getDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }
}
