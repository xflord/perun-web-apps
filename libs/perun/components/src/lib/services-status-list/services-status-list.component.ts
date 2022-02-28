import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { Facility, Service, ServiceState } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import { formatDate } from '@angular/common';
import { TableWrapperComponent } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-services-status-list',
  templateUrl: './services-status-list.component.html',
  styleUrls: ['./services-status-list.component.css'],
})
export class ServicesStatusListComponent implements OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input() servicesStatus: ServiceState[] = [];
  @Input() displayedColumns: string[] = [
    'select',
    'task.id',
    'service.name',
    'status',
    'blocked',
    'task.startTime',
    'task.endTime',
  ];
  @Input() selection = new SelectionModel<ServiceState>(true, []);
  @Input() filterValue: string;
  @Input() tableId: string;
  @Input() disableRouting = true;
  @Output() selectionChange: EventEmitter<() => void> = new EventEmitter<() => void>();

  dataSource: MatTableDataSource<ServiceState>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  private sort: MatSort;

  constructor(private authResolver: GuiAuthResolver, private tableCheckbox: TableCheckbox) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getSortDataForColumn(data: ServiceState, column: string): string {
    switch (column) {
      case 'task.id':
        return data.task ? data.task.id.toString() : (data[column] as string);
      case 'service.name':
        return data.service.name;
      case 'status':
        return data.status;
      case 'blocked':
        if (data.blockedOnFacility) {
          return 'BLOCKED';
        }
        if (data.blockedGlobally) {
          return 'BLOCKED GLOBALLY';
        }
        return 'ALLOWED';
      case 'task.startTime':
        return data.task?.startTime
          ? formatDate(data.task.startTime, 'yyyy.MM.dd HH:mm:ss', 'en')
          : (data[column] as string);
      case 'task.endTime':
        return data.task?.endTime
          ? formatDate(data.task.endTime, 'yyyy.MM.dd HH:mm:ss', 'en')
          : (data[column] as string);
      default:
        return data[column] as string;
    }
  }

  static getDataForColumn(data: ServiceState, column: string): string {
    switch (column) {
      case 'task.id':
        return data.task ? data.task.id.toString() : (data[column] as string);
      case 'service.name':
        return data.service.name;
      case 'status':
        return data.status;
      case 'blocked':
        if (data.blockedOnFacility) {
          return 'BLOCKED';
        }
        if (data.blockedGlobally) {
          return 'BLOCKED GLOBALLY';
        }
        return 'ALLOWED';
      case 'task.startTime':
        return data.task?.startTime
          ? formatDate(data.task.startTime, 'd.M.y H:mm:ss', 'en')
          : (data[column] as string);
      case 'task.endTime':
        return data.task?.endTime
          ? formatDate(data.task.endTime, 'd.M.y H:mm:ss', 'en')
          : (data[column] as string);
      default:
        return data[column] as string;
    }
  }

  ngOnChanges(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'task.id');
    }
    this.dataSource = new MatTableDataSource<ServiceState>(this.servicesStatus);
    this.setDataSource();
    this.dataSource.filterPredicate = (data, filter): boolean => {
      const transformedFilter = filter.trim().toLowerCase();

      const listAsFlatString = (obj: ServiceState | Facility | Service): string => {
        let returnVal = '';

        Object.values(obj).forEach((val: string | number | Facility | Service) => {
          if (typeof val !== 'object') {
            returnVal = returnVal + ' ' + String(val);
          } else if (val !== null) {
            returnVal = returnVal + ' ' + listAsFlatString(val);
          }
        });

        return returnVal.trim().toLowerCase();
      };

      return listAsFlatString(data).includes(transformedFilter);
    };
    this.dataSource.filter = this.filterValue;
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        ServicesStatusListComponent.getDataForColumn
      ),
      format
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: ServiceState, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          ServicesStatusListComponent.getDataForColumn
        );
      this.dataSource.sortData = (data: ServiceState[], sort: MatSort): ServiceState[] =>
        customDataSourceSort(data, sort, ServicesStatusListComponent.getSortDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelected(
      this.selection.selected.length,
      this.filterValue,
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.dataSource
    );
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ServiceState): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.service.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }
}
