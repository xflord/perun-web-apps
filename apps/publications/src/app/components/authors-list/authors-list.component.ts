import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { Author } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  parseAttribute,
  parseFullName,
  parseName,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

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
    'add',
    'remove',
  ];
  @Input() disableRouting = false;
  @Input() reloadTable: boolean;
  @Input() selection: SelectionModel<Author>;
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Output() addAuthor = new EventEmitter();
  @Output() removeAuthor = new EventEmitter();
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  dataSource: MatTableDataSource<Author>;
  private sort: MatSort;

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
        return parseAttribute(data, 'organization');
      case 'email':
        return parseAttribute(data, 'preferredMail');
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
        return parseAttribute(data, 'organization');
      case 'email':
        return parseAttribute(data, 'preferredMail');
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
        return parseAttribute(data, 'organization');
      case 'email':
        return parseAttribute(data, 'preferredMail');
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

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Author): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  onAddClick(author: Author): void {
    this.addAuthor.emit(author);
  }

  onRemoveClick(author: Author): void {
    this.removeAuthor.emit(author);
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
