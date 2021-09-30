import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  ViewChild
} from '@angular/core';
import { ExtSource, UserExtSource} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort, downloadData, getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS, TableWrapperComponent
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-ext-sources-list',
  templateUrl: './ext-sources-list.component.html',
  styleUrls: ['./ext-sources-list.component.scss']
})
export class ExtSourcesListComponent implements AfterViewInit, OnChanges {

  constructor(private authResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox) {
  }

  @Input()
  extSources: ExtSource[];
  @Input()
  selection: SelectionModel<ExtSource> = new SelectionModel<ExtSource>();
  @Input()
  filterValue = '';
  @Input()
  displayedColumns: string[] = ['select', 'id', 'name', 'type'];
  @Input()
  tableId: string;

  @ViewChild(TableWrapperComponent, {static: true}) child: TableWrapperComponent;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  private sort: MatSort;

  dataSource: MatTableDataSource<ExtSource>;
  exporting = false;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngAfterViewInit() {
    this.setDataSource();
  }

  ngOnChanges(): void {
    if (!this.authResolver.isPerunAdminOrObserver()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<ExtSource>(this.extSources);
    this.setDataSource();
  }

  getDataForColumn(data: ExtSource, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'type':
        return data.type.substring(40);
      case 'name':
        return  data.name;
      default:
        return '';
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  setDataSource() {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: UserExtSource, filter: string) => customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this);
      this.dataSource.sortData = (data: UserExtSource[], sort: MatSort) => customDataSourceSort(data, sort, this.getDataForColumn, this);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.child.paginator.pageSize, this.child.paginator.hasNextPage(), this.dataSource);
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.child.paginator.pageSize, this.child.paginator.pageIndex,false);
  }

  checkboxLabel(row?: ExtSource): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
}
