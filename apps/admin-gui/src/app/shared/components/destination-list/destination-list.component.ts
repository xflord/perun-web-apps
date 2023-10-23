import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { RichDestination, Vo } from '@perun-web-apps/perun/openapi';
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
import { LastSuccessfulPropagationPipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'app-perun-web-apps-destination-list',
  templateUrl: './destination-list.component.html',
  styleUrls: ['./destination-list.component.scss'],
  providers: [LastSuccessfulPropagationPipe],
})
export class DestinationListComponent implements AfterViewInit, OnChanges {
  @Input()
  destinations: RichDestination[] = [];
  @Input()
  selection = new SelectionModel<RichDestination>(true, []);
  @Input()
  filterValue = '';
  @Input()
  tableId: string;
  @Input()
  displayedColumns: string[];
  @Input()
  services: Set<number>;
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  dataSource: MatTableDataSource<RichDestination>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  private sort: MatSort;

  constructor(
    private authResolver: GuiAuthResolver,
    private tableCheckbox: TableCheckbox,
    private lastSuccessPipe: LastSuccessfulPropagationPipe,
  ) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  getDataForColumn(data: RichDestination, column: string): string {
    switch (column) {
      case 'destinationId':
        return data.id.toString();
      case 'service':
        return data.service.name;
      case 'facility':
        return data.facility.name;
      case 'destination':
        return data.destination;
      case 'type':
        return data.type;
      case 'status':
        return data.blocked ? 'blocked' : 'allowed';
      case 'propagationType':
        return data.propagationType;
      case 'lastSuccessfulPropagation':
        return this.lastSuccessPipe.transform(data.lastSuccessfulPropagation);
      default:
        return '';
    }
  }

  ngOnChanges(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'destinationId');
    }
    this.dataSource = new MatTableDataSource<RichDestination>(this.destinations);
    this.setDataSource();
    this.dataSource.filter = this.filterValue.toLowerCase();
  }

  exportAllData(format: string): void {
    downloadData(
      getDataForExport(this.dataSource.filteredData, this.displayedColumns, (data, column) =>
        this.getDataForColumn(data, column),
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
        (data, column) => this.getDataForColumn(data, column),
      ),
      format,
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: RichDestination, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          (destination, column) => this.getDataForColumn(destination, column),
        );
      this.dataSource.sortData = (data: Vo[], sort: MatSort): Vo[] =>
        customDataSourceSort(data, sort, (destination, column) =>
          this.getDataForColumn(destination, column),
        );
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
