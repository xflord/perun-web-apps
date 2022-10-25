import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { Author } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  findAttribute,
  parseFullName,
  parseName,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-authors-list',
  templateUrl: './authors-list.component.html',
  styleUrls: ['./authors-list.component.scss'],
})
export class AuthorsListComponent implements AfterViewInit, OnChanges {
  @Input() authors: Author[] = [];
  @Input() filterValue: string;
  @Input() tableId: string;
  @Input() displayedColumns: string[] = [
    'select',
    'id',
    'name',
    'organization',
    'email',
    'numberOfPublications',
  ];
  @Input() disableRouting = false;
  @Input() reloadTable: boolean;
  @Input() selection = new SelectionModel<Author>(true, []);
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  dataSource: MatTableDataSource<Author>;
  private sort: MatSort;

  constructor(private tableCheckbox: TableCheckbox) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getFilterDataForColumn(data: Author, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return parseName(data);
      case 'organization':
        return findAttribute(data.attributes, 'organization');
      case 'email':
        return findAttribute(data.attributes, 'preferredMail');
      case 'numberOfPublications':
        return data.authorships.length.toString();
      default:
        return data[column] as string;
    }
  }

  static getExportDataForColumn(data: Author, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return parseFullName(data);
      case 'organization':
        return findAttribute(data.attributes, 'organization');
      case 'email':
        return findAttribute(data.attributes, 'preferredMail');
      case 'numberOfPublications':
        return data.authorships.length.toString();
      default:
        return data[column] as string;
    }
  }

  static getSortDataForColumn(data: Author, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return data.lastName ? data.lastName : data.firstName ?? '';
      case 'organization':
        return findAttribute(data.attributes, 'organization');
      case 'email':
        return findAttribute(data.attributes, 'preferredMail');
      case 'numberOfPublications':
        return data.authorships.length.toString();
      default:
        return data[column] as string;
    }
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<Author>(this.authors);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  exportAllData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        AuthorsListComponent.getExportDataForColumn
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
        AuthorsListComponent.getExportDataForColumn
      ),
      format
    );
  }

  parseAttribute(data: Author, nameOfAttribute: string): string {
    let attribute = '';
    if (data.attributes) {
      data.attributes.forEach((attr) => {
        if (attr.friendlyName === nameOfAttribute) {
          attribute = attr.value as string;
        }
      });
    }
    return attribute;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.dataSource);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
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

  private setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: Author, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          AuthorsListComponent.getFilterDataForColumn
        );
      this.dataSource.sortData = (data: Author[], sort: MatSort): Author[] =>
        customDataSourceSort(data, sort, AuthorsListComponent.getSortDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }
}
