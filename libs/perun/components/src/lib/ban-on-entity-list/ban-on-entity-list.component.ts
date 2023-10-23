import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import {
  EnrichedBanOnFacility,
  EnrichedBanOnResource,
  EnrichedBanOnVo,
  Facility,
  Resource,
  RichMember,
  RichUser,
  User,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { formatDate } from '@angular/common';
import { BAN_EXPIRATION_NEVER } from '../ban-specification/ban-specification.component';

export type EnrichedBan = EnrichedBanOnVo | EnrichedBanOnFacility | EnrichedBanOnResource;
export type BanOnEntityListColumn =
  | 'select'
  | 'banId'
  | 'targetName'
  | 'targetId'
  | 'subjectName'
  | 'subjectId'
  | 'description'
  | 'expiration'
  | 'edit';

@Component({
  selector: 'perun-web-apps-ban-on-entity-list',
  templateUrl: './ban-on-entity-list.component.html',
  styleUrls: ['./ban-on-entity-list.component.scss'],
  providers: [UserFullNamePipe],
})
export class BanOnEntityListComponent {
  @Input() selection = new SelectionModel<EnrichedBan>(false, []);
  @Input() tableId: string;
  @Input() updatePolicy: string;
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input() columns: BanOnEntityListColumn[] = [
    'select',
    'banId',
    'targetId',
    'targetName',
    'subjectId',
    'subjectName',
    'description',
    'expiration',
    'edit',
  ];
  @Output() updateBan = new EventEmitter<EnrichedBan>();
  @ViewChild(TableWrapperComponent, { static: true }) tableWrapper: TableWrapperComponent;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: MatTableDataSource<EnrichedBan>;
  target: string;
  subject: string;
  // This date is set by backend as a 'never' expire option
  EXPIRE_NEVER = BAN_EXPIRATION_NEVER;

  constructor(
    private tableCheckbox: TableCheckbox,
    private authResolver: GuiAuthResolver,
    private userName: UserFullNamePipe,
  ) {}

  @Input() set bans(bans: EnrichedBan[]) {
    if (!this.dataSource) {
      this.dataSourceInit(bans);
    }
    if (bans.length !== 0) {
      this.setHeaderLabels(bans[0]);
    }

    this.dataSource.data = bans;
  }

  @Input() set filter(value: string) {
    this.dataSource.filter = value;
  }

  @Input() set displayedColumns(columns: BanOnEntityListColumn[]) {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      columns = columns.filter((column) => !column.endsWith('Id'));
    }
    this.columns = columns;
  }

  getDataForColumn = (data: EnrichedBan, column: BanOnEntityListColumn): string => {
    const target: Vo | Facility | Resource = this.isFacilityBan(data)
      ? data.facility
      : this.isResourceBan(data)
      ? data.resource
      : data.vo;
    const subject: RichUser | RichMember = this.isFacilityBan(data) ? data.user : data.member;
    const subjectUser: User = this.isFacilityBan(data) ? data.user : data.member.user;
    switch (column) {
      case 'banId':
        return String(data.ban.id);
      case 'targetId':
        return String(target.id);
      case 'targetName':
        return target.name;
      case 'subjectId':
        return String(subject.id);
      case 'subjectName':
        return this.userName.transform(subjectUser);
      case 'description':
        return data.ban.description;
      case 'expiration':
        return Number(data.ban.validityTo) === this.EXPIRE_NEVER
          ? 'never'
          : formatDate(data.ban.validityTo, 'dd-MM-yyy', 'en');
      default:
        return '';
    }
  };

  exportAllData(format: string): void {
    downloadData(
      getDataForExport(this.dataSource.filteredData, this.columns, this.getDataForColumn),
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
        this.columns,
        this.getDataForColumn,
      ),
      format,
    );
  }

  toggle(ban: EnrichedBan): void {
    this.selection.toggle(ban);
  }

  masterToggle(allSelected: boolean): void {
    this.tableCheckbox.masterToggle(
      allSelected,
      this.selection,
      this.dataSource.filter,
      this.dataSource,
      this.dataSource.sort,
      this.dataSource.paginator.pageSize,
      this.dataSource.paginator.pageIndex,
      false,
    );
  }

  private dataSourceInit(bans: EnrichedBan[]): void {
    this.dataSource = new MatTableDataSource(bans);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.tableWrapper.paginator;
    this.dataSource.filterPredicate = (data: EnrichedBan, filter: string): boolean =>
      customDataSourceFilterPredicate(data, filter, this.columns, this.getDataForColumn, true);
    this.dataSource.sortData = (data: EnrichedBan[], sort: MatSort): EnrichedBan[] =>
      customDataSourceSort(data, sort, this.getDataForColumn);
  }

  private isFacilityBan(ban: EnrichedBan): ban is EnrichedBanOnFacility {
    return 'facility' in ban;
  }

  private isResourceBan(ban: EnrichedBan): ban is EnrichedBanOnResource {
    return 'resource' in ban;
  }

  private setHeaderLabels(ban: EnrichedBan): void {
    // FIXME not scalable and misses translation
    if (this.isFacilityBan(ban)) {
      this.target = 'Facility';
      this.subject = 'User';
    } else if (this.isResourceBan(ban)) {
      this.target = 'Resource';
      this.subject = 'Member';
    } else {
      this.target = 'Organization';
      this.subject = 'Member';
    }
  }
}
