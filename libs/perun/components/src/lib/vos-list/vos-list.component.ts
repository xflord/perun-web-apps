import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EnrichedVo, Vo } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { TableWrapperComponent } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-vos-list',
  templateUrl: './vos-list.component.html',
  styleUrls: ['./vos-list.component.scss'],
})
export class VosListComponent implements OnChanges {
  constructor(private authResolver: GuiAuthResolver) {}

  @Input()
  vos: Vo[] | EnrichedVo[] = [];

  @Input()
  recentIds: number[];

  @Input()
  filterValue: string;

  @Input()
  selection: SelectionModel<Vo | EnrichedVo>;

  @Input()
  displayedColumns: string[] = [];

  @Input()
  disableRouting = false;

  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Input()
  tableId: string;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  private sort: MatSort;

  dataSource: MatTableDataSource<Vo | EnrichedVo>;
  static isEnrichedVo = (vo: Vo | EnrichedVo): vo is EnrichedVo =>
    (vo as EnrichedVo).vo !== undefined;

  ngOnChanges() {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    this.setDataSource();
  }

  getDataForColumn(data: Vo | EnrichedVo, column: string, otherThis: VosListComponent): string {
    if (VosListComponent.isEnrichedVo(data)) {
      data = data.vo;
    }

    switch (column) {
      case 'id':
        return data.id.toString();
      case 'shortName':
        return data.shortName;
      case 'name':
        return data.name;
      case 'recent':
        if (otherThis.recentIds) {
          if (otherThis.recentIds.indexOf(data.id) > -1) {
            return '#'.repeat(otherThis.recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      default:
        return data[column];
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
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<Vo>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filterPredicate = (data: Vo, filter: string) =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          this.getDataForColumn,
          this
        );
      this.dataSource.sortData = (data: Vo[], sort: MatSort) =>
        customDataSourceSort(data, sort, this.getDataForColumn, this);
    }
    this.dataSource.filter = this.filterValue;
    this.dataSource.data = this.vos;
  }

  checkboxLabel(row?: Vo): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
}
