import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { SecurityTeam, Vo } from '@perun-web-apps/perun/openapi';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-security-teams-list',
  templateUrl: './security-teams-list.component.html',
  styleUrls: ['./security-teams-list.component.scss'],
})
export class SecurityTeamsListComponent implements AfterViewInit, OnChanges {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input()
  securityTeams: SecurityTeam[] = [];
  @Input()
  selection = new SelectionModel<SecurityTeam>(true, []);
  @Input()
  filterValue: string;
  @Input()
  tableId: string;
  @Input()
  displayedColumns: string[] = ['select', 'id', 'name', 'description'];
  dataSource: MatTableDataSource<SecurityTeam>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  private sort: MatSort;

  constructor(
    private authResolver: GuiAuthResolver,
    private tableCheckbox: TableCheckbox,
  ) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getDataForColumn(data: SecurityTeam, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return data.name;
      case 'description':
        return data.description;
      default:
        return '';
    }
  }

  ngOnChanges(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<SecurityTeam>(this.securityTeams);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  exportAllData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        SecurityTeamsListComponent.getDataForColumn,
      ),
      format,
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
        SecurityTeamsListComponent.getDataForColumn,
      ),
      format,
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: SecurityTeam, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          SecurityTeamsListComponent.getDataForColumn,
        );
      this.dataSource.sortData = (data: Vo[], sort: MatSort): Vo[] =>
        customDataSourceSort(data, sort, SecurityTeamsListComponent.getDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
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
      false,
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }
}
