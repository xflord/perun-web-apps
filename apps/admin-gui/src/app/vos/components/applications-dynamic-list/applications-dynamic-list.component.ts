import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import {
  Application,
  ApplicationFormItemData,
  ApplicationsOrderColumn,
  AppState,
  Group,
  Member,
  RichApplication,
  Vo,
} from '@perun-web-apps/perun/openapi';
import {
  downloadData,
  getDataForExport,
  parseFullName,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import {
  DynamicDataSource,
  DynamicPaginatingService,
  GuiAuthResolver,
} from '@perun-web-apps/perun/services';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-applications-dynamic-list',
  templateUrl: './applications-dynamic-list.component.html',
  styleUrls: ['./applications-dynamic-list.component.css'],
})
export class ApplicationsDynamicListComponent implements OnInit, OnChanges, AfterViewInit {
  constructor(
    private authResolver: GuiAuthResolver,
    private tableConfigService: TableConfigService,
    private dynamicPaginatingService: DynamicPaginatingService
  ) {}

  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  @ViewChild(MatSort) sort: MatSort;

  @Input()
  displayedColumns: string[] = [];

  @Input()
  tableId: string;

  @Input()
  disableRouting = false;

  @Input()
  searchString = '';

  @Input()
  group: Group;

  @Input()
  member: Member;

  @Input()
  vo: Vo;

  @Input()
  includeGroupApps: boolean;

  @Input()
  states: AppState[];

  @Input()
  dateTo: Date = new Date();

  @Input()
  dateFrom: Date = this.yearAgo();

  @Input()
  refreshTable = false;

  @Input()
  parsedColumns: string[] = [];

  dataSource: DynamicDataSource<Application>;

  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.child.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.child.paginator.page)
      .pipe(tap(() => this.loadApplicationsPage()))
      .subscribe();
  }

  ngOnInit() {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }

    this.dataSource = new DynamicDataSource<Application>(
      this.dynamicPaginatingService,
      this.authResolver
    );

    this.dataSource.loadApplications(
      this.tableConfigService.getTablePageSize(this.tableId),
      0,
      'DESCENDING',
      this.getSortDataColumn(),
      this.searchString,
      this.includeGroupApps,
      this.states,
      this.dateToString(this.dateFrom),
      this.dateToString(this.dateTo),
      this.member?.userId ?? null,
      this.group?.id ?? null,
      this.getVoId()
    );

    this.dataSource.loading$.subscribe((val) => {
      if (val || !this.displayedColumns.includes('fedInfo')) return;

      this.displayedColumns = this.displayedColumns.filter((v) => !this.parsedColumns.includes(v));
      this.parsedColumns = [];

      const data = <RichApplication>this.dataSource.getData()[0];
      this.parseColumns(data.formData);
    });
  }

  ngOnChanges() {
    this.refreshTable = false;
    if (this.dataSource) {
      this.child.paginator.pageIndex = 0;
      this.loadApplicationsPage();
    }
  }

  loadApplicationsPage() {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    this.dataSource.loadApplications(
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      sortDirection,
      this.getSortDataColumn(),
      this.searchString,
      this.includeGroupApps,
      this.states,
      this.dateToString(this.dateFrom),
      this.dateToString(this.dateTo),
      this.member?.userId ?? null,
      this.group?.id ?? null,
      this.getVoId(),
      true
    );
  }

  exportData(format: string) {
    downloadData(
      getDataForExport(
        this.dataSource.getData(),
        this.displayedColumns,
        this.getExportDataForColumn,
        this
      ),
      format
    );
  }

  selectApplication(application: Application) {
    if (!this.disableRouting) {
      if (this.group) {
        return [
          '/organizations',
          application.vo.id,
          'groups',
          this.group.id,
          'applications',
          application.id,
        ];
      } else if (this.member) {
        return [
          '/organizations',
          application.vo.id,
          'members',
          this.member.id,
          'applications',
          application.id,
        ];
      } else {
        return ['/organizations', application.vo.id, 'applications', application.id];
      }
    }
    return null;
  }

  getExportDataForColumn(data: Application, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'voId':
        return data.vo.id.toString();
      case 'voName':
        return data.vo.name;
      case 'groupId':
        return data.group?.id.toString() ?? '';
      case 'groupName':
        return data.group?.name ?? '';
      case 'type':
        return data.type;
      case 'fedInfo':
        return data.fedInfo;
      case 'formData':
        return this.stringify((<RichApplication>data).formData);
      case 'state':
        return data.state;
      case 'extSourceName':
        return data.extSourceName;
      case 'extSourceType':
        return data.extSourceType;
      case 'user':
        return data.user ? parseFullName(data.user) : '';
      case 'createdBy':
        return data.createdBy;
      case 'createdAt':
        return data.createdAt;
      case 'modifiedBy':
        return data.modifiedBy;
      case 'modifiedAt':
        return data.modifiedAt;
      default:
        return data[column];
    }
  }

  getSortDataColumn() {
    if (!this.sort) {
      return ApplicationsOrderColumn.DATECREATED;
    }
    switch (this.sort.active) {
      case 'id':
        return ApplicationsOrderColumn.ID;
      case 'createdAt':
        return ApplicationsOrderColumn.DATECREATED;
      case 'type':
        return ApplicationsOrderColumn.TYPE;
      case 'state':
        return ApplicationsOrderColumn.STATE;
      case 'user':
        return ApplicationsOrderColumn.SUBMITTER;
      case 'groupName':
        return ApplicationsOrderColumn.GROUPNAME;
      case 'modifiedBy':
        return ApplicationsOrderColumn.MODIFIEDBY;
      default:
        return ApplicationsOrderColumn.DATECREATED;
    }
  }

  getFriendlyName(name: string) {
    const index = name.lastIndexOf('/CN=');
    if (index !== -1) {
      const string = name.slice(index + 4, name.length).replace('/unstructuredName=', ' ');
      if (string.lastIndexOf('\\') !== -1) {
        return name.slice(name.lastIndexOf('=') + 1, name.length);
      }
      return string;
    }
    return name;
  }

  yearAgo() {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 365);
    return newDate;
  }

  dateToString(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-GB');
  }

  getVoId() {
    if (this.vo) {
      return this.vo.id;
    }
    if (this.group) {
      return this.group.voId;
    }
    if (this.member) {
      return this.member.voId;
    }
  }

  stringify(obj: object) {
    const removeNullUndefined = (toFilter: object) =>
      Object.entries(toFilter).reduce(
        (a, [k, v]) =>
          a[k] instanceof Object
            ? (a[k] = removeNullUndefined(a[k]))
            : v == null || v === 'null' || (<string>v).length === 0
            ? a
            : ((a[k] = v), a),
        {}
      );

    let str = JSON.stringify(removeNullUndefined(obj));
    str = str.replace('{', '[');
    str = str.replace('}', ']');
    return str;
  }

  getFormDataString(data: ApplicationFormItemData) {
    return this.stringify(data.formItem);
  }

  parseColumns(array: Array<ApplicationFormItemData>) {
    array.forEach((val) => {
      if (!this.displayedColumns.includes(val.shortname)) {
        this.displayedColumns.push(val.shortname);
      }
      if (!this.parsedColumns.includes(val.shortname)) {
        this.parsedColumns.push(val.shortname);
      }
    });
  }

  getValue(array: Array<ApplicationFormItemData>, colName: string) {
    const filter = array.filter((value) => value.shortname === colName);
    if (filter.length === 0) {
      return '';
    }
    return filter[0].value ?? filter[0].prefilledValue;
  }
}
