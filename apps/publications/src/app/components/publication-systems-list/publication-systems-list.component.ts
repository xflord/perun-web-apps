import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { PublicationSystem } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'perun-web-apps-publication-systems-list',
  templateUrl: './publication-systems-list.component.html',
  styleUrls: ['./publication-systems-list.component.scss'],
})
export class PublicationSystemsListComponent implements AfterViewInit, OnChanges {
  @Input() publicationSystems: PublicationSystem[] = [];
  @Input() filterValue: string;
  @Input() tableId: string;
  @Input() displayedColumns: string[] = ['id', 'friendlyName', 'loginNamespace', 'url', 'type'];
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  dataSource: MatTableDataSource<PublicationSystem>;
  private sort: MatSort;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getDataForColumn(data: PublicationSystem, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'friendlyName':
        return data.friendlyName;
      case 'url':
        return data.url;
      case 'loginNamespace':
        return data.loginNamespace;
      case 'type':
        return data.type;
      default:
        return data[column] as string;
    }
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<PublicationSystem>(this.publicationSystems);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        PublicationSystemsListComponent.getDataForColumn
      ),
      format
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: PublicationSystem, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          PublicationSystemsListComponent.getDataForColumn
        );
      this.dataSource.sortData = (data: PublicationSystem[], sort: MatSort): PublicationSystem[] =>
        customDataSourceSort(data, sort, PublicationSystemsListComponent.getDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }
}
