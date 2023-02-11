import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Consent,
  ConsentsManagerService,
  ConsentStatus,
  RichUser,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  parseFullName,
  parseLogins,
  parseUserEmail,
  parseVo,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import {
  DynamicDataSource,
  DynamicPaginatingService,
  GuiAuthResolver,
  TableCheckbox,
} from '@perun-web-apps/perun/services';
import { merge, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { ExportDataDialogComponent } from '@perun-web-apps/perun/dialogs';
import { UserWithConsentStatus } from '@perun-web-apps/perun/models';
import { ConsentStatusIconPipe } from '@perun-web-apps/perun/pipes';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-users-dynamic-list',
  templateUrl: './users-dynamic-list.component.html',
  styleUrls: ['./users-dynamic-list.component.css'],
  providers: [ConsentStatusIconPipe],
})
export class UsersDynamicListComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @ViewChild(MatSort) sort: MatSort;
  @Input() selection = new SelectionModel<RichUser>(true, []);
  @Input() displayedColumns: string[] = [
    'select',
    'user',
    'id',
    'name',
    'email',
    'logins',
    'organization',
  ];
  @Input() tableId: string;
  @Input() disableRouting = false;
  @Input() searchString = '';
  @Input() attrNames: string[] = [];
  @Input() withoutVo: boolean;
  @Input() updateTable: boolean;
  @Input() facilityId: number;
  @Input() voId: number;
  @Input() resourceId: number;
  @Input() serviceId: number;
  @Input() onlyAllowed: boolean;
  @Input() consentStatuses: ConsentStatus[];
  @Input() includeConsents = false;
  @Output() loading$: EventEmitter<Observable<boolean>> = new EventEmitter<Observable<boolean>>();

  consents: Consent[];
  dataSource: DynamicDataSource<RichUser>;
  svgIcon = 'perun-service-identity-black';
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  constructor(
    private authResolver: GuiAuthResolver,
    private consentService: ConsentsManagerService,
    private tableCheckbox: TableCheckbox,
    private tableConfigService: TableConfigService,
    private dynamicPaginatingService: DynamicPaginatingService,
    private dialog: MatDialog,
    private consentPipe: ConsentStatusIconPipe,
    private translate: TranslateService
  ) {}

  static getExportDataForColumn(data: UserWithConsentStatus, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'user':
        return data.serviceUser ? 'service-user' : 'user';
      case 'name':
        if (data) {
          return parseFullName(data);
        }
        return '';
      case 'organization':
        return parseVo(data);
      case 'email':
        return parseUserEmail(data);
      case 'logins':
        return parseLogins(data);
      case 'consentStatus':
        return data.consent;
      default:
        return '';
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.child.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.child.paginator.page)
      .pipe(tap(() => this.loadUsersPage()))
      .subscribe();
  }

  ngOnInit(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    if (this.includeConsents) {
      this.displayedColumns.push('consentStatus');
    }

    this.dataSource = new DynamicDataSource<RichUser>(
      this.dynamicPaginatingService,
      this.authResolver
    );
    this.loadConsents();
    this.dataSource.loadUsers(
      this.attrNames,
      this.tableConfigService.getTablePageSize(this.tableId),
      0,
      'ASCENDING',
      'NAME',
      this.searchString,
      this.withoutVo,
      this.facilityId,
      this.voId,
      this.resourceId,
      this.serviceId,
      this.onlyAllowed,
      this.consentStatuses
    );
    this.loading$.emit(this.dataSource.loading$);
  }

  ngOnChanges(): void {
    if (this.dataSource) {
      this.child.paginator.pageIndex = 0;
      this.loadUsersPage();
    }
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.getData().forEach((row) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().length;
    return numSelected === numRows;
  }

  loadUsersPage(): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'name' ? 'NAME' : 'ID';
    this.dataSource.loadUsers(
      this.attrNames,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      sortDirection,
      sortColumn,
      this.searchString,
      this.withoutVo,
      this.facilityId,
      this.voId,
      this.resourceId,
      this.serviceId,
      this.onlyAllowed,
      this.consentStatuses
    );
  }

  loadConsents(): void {
    if (this.includeConsents) {
      this.consentService
        .getConsentHubByFacility(this.facilityId)
        .subscribe((consentHub) =>
          this.consentService
            .getConsentsForConsentHub(consentHub.id)
            .subscribe((consents) => (this.consents = consents))
        );
    }
  }

  exportDisplayedData(format: string): void {
    downloadData(
      getDataForExport(
        this.getConsentsForUsers(this.dataSource.getData()),
        this.displayedColumns,
        UsersDynamicListComponent.getExportDataForColumn
      ),
      format
    );
  }

  exportAllData(format: string): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'name' ? 'NAME' : 'ID';

    const config = getDefaultDialogConfig();
    config.width = '300px';
    const exportLoading = this.dialog.open(ExportDataDialogComponent, config);

    this.dataSource
      .getAllUsers(
        this.attrNames,
        sortDirection,
        this.child.paginator.length,
        sortColumn,
        this.searchString,
        this.withoutVo,
        this.facilityId,
        this.voId,
        this.resourceId,
        this.serviceId,
        this.onlyAllowed,
        this.consentStatuses
      )
      .subscribe((response) => {
        exportLoading.close();
        downloadData(
          getDataForExport(
            this.getConsentsForUsers(response),
            this.displayedColumns,
            UsersDynamicListComponent.getExportDataForColumn
          ),
          format
        );
      });
  }

  getConsentsForUsers(users: RichUser[]): UserWithConsentStatus[] | RichUser[] {
    const result: UserWithConsentStatus[] = [];
    if (this.includeConsents) {
      users.forEach((user) => {
        const uwc: UserWithConsentStatus = user;
        uwc.consent = this.translate.instant(
          'CONSENTS.STATUS_' + this.consentPipe.transform(user.id, this.consents)
        ) as string;
        result.push(uwc);
      });
      return result;
    }
    return users;
  }
}
