import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EnrichedVo, Group, Vo } from '@perun-web-apps/perun/openapi';
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
  @Input() vos: Vo[] | EnrichedVo[] = [];
  @Input() voWithAuthzGroupPairs: Map<number, Group[]>;
  @Input() authzVoNames: Map<number, string>;
  @Input() recentIds: number[];
  @Input() filterValue: string;
  @Input() selection: SelectionModel<Vo>;
  @Input() displayedColumns: string[] = [];
  @Input() disableRouting = false;
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input() tableId: string;
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  dataSource: MatTableDataSource<Vo | EnrichedVo>;
  private sort: MatSort;

  constructor(private authResolver: GuiAuthResolver) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  static isEnrichedVo = (vo: Vo | EnrichedVo): vo is EnrichedVo =>
    (vo as EnrichedVo).vo !== undefined;

  static getDataForColumn(data: Vo | EnrichedVo, column: string, recentIds: number[]): string {
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
        if (recentIds) {
          if (recentIds.includes(data.id)) {
            return '#'.repeat(recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      default:
        return data[column] as string;
    }
  }

  getDataForColumnFun = (data: Vo, column: string): string => {
    return VosListComponent.getDataForColumn(data, column, this.recentIds);
  };

  ngOnChanges(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    this.setDataSource();
  }

  exportAllData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        this.getDataForColumnFun
      ),
      format
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
        this.getDataForColumnFun
      ),
      format
    );
  }

  setDataSource(): void {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<Vo>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filterPredicate = (data: Vo, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          this.getDataForColumnFun
        );
      this.dataSource.sortData = (data: Vo[], sort: MatSort): (Vo | EnrichedVo)[] =>
        customDataSourceSort(data, sort, this.getDataForColumnFun);
    }
    this.dataSource.filter = this.filterValue;
    this.dataSource.data = this.vos;
  }
}
