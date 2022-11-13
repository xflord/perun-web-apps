import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ChangeGroupExpirationDialogComponent,
  ChangeMemberStatusDialogComponent,
  ChangeVoExpirationDialogComponent,
  MemberTreeViewDialogComponent,
  ExportDataDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import {
  DynamicDataSource,
  DynamicPaginatingService,
  GuiAuthResolver,
  TableCheckbox,
  EntityStorageService,
} from '@perun-web-apps/perun/services';
import {
  Member,
  MemberGroupStatus,
  RichMember,
  VoMemberStatuses,
} from '@perun-web-apps/perun/openapi';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  TABLE_ITEMS_COUNT_OPTIONS,
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  isMemberIndirect,
  parseEmail,
  parseFullName,
  parseLogins,
  parseOrganization,
  isMemberIndirectString,
} from '@perun-web-apps/perun/utils';

import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import { TableWrapperComponent } from '@perun-web-apps/perun/utils';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-members-dynamic-list',
  templateUrl: './members-dynamic-list.component.html',
  styleUrls: ['./members-dynamic-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MembersDynamicListComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @ViewChild(MatSort) sort: MatSort;
  @Input() selection: SelectionModel<RichMember>;
  @Input() displayedColumns: string[] = [
    'checkbox',
    'id',
    'type',
    'fullName',
    'status',
    'groupStatus',
    'organization',
    'email',
    'logins',
  ];
  @Input() voId: number;
  @Input() groupId: number;
  @Input() selectedGroupStatuses: MemberGroupStatus[] = [];
  @Input() attrNames: string[];
  @Input() searchString: string;
  @Input() selectedStatuses: VoMemberStatuses[];
  @Input() tableId: string;
  @Input() updateTable: boolean;
  @Input() isMembersGroup: boolean;
  @Input() disableRouting = false;

  expireGroupAuth: boolean;
  expireVoAuth: boolean;

  dataSource: DynamicDataSource<RichMember>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  constructor(
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private tableCheckbox: TableCheckbox,
    private tableConfigService: TableConfigService,
    private dynamicPaginatingService: DynamicPaginatingService,
    private entityStorage: EntityStorageService
  ) {}

  static getExportDataForColumn(data: RichMember, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'fullName':
        if (data.user) {
          return parseFullName(data.user);
        }
        return '';
      case 'status':
        return data.status;
      case 'groupStatus':
        return data.groupStatus;
      case 'organization':
        return parseOrganization(data);
      case 'email':
        return parseEmail(data);
      case 'logins':
        return parseLogins(data);
      default:
        return '';
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.child.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.child.paginator.page)
      .pipe(tap(() => this.loadMembersPage()))
      .subscribe();
  }

  ngOnInit(): void {
    this.expireGroupAuth = this.authResolver.isAuthorized(
      'setMemberGroupStatus_Member_Group_MemberGroupStatus_policy',
      [this.entityStorage.getEntity()]
    );
    this.expireVoAuth = this.authResolver.isAuthorized('setStatus_Member_Status_policy', [
      this.entityStorage.getEntity(),
    ]);
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    this.dataSource = new DynamicDataSource<RichMember>(
      this.dynamicPaginatingService,
      this.authResolver
    );
    this.dataSource.loadMembers(
      this.voId,
      this.attrNames,
      'ASCENDING',
      0,
      this.tableConfigService.getTablePageSize(this.tableId),
      'NAME',
      this.selectedStatuses,
      this.searchString,
      this.groupId,
      this.selectedGroupStatuses
    );
  }

  canBeSelected = (member: RichMember): boolean => !isMemberIndirect(member);

  ngOnChanges(): void {
    if (this.dataSource) {
      this.child.paginator.pageIndex = 0;
      this.loadMembersPage();
    }
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.getData().forEach((row) => {
        if (this.canBeSelected(row)) {
          this.selection.select(row);
        }
      });
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.getData().filter((member) => this.canBeSelected(member)).length;
    return numSelected === numRows;
  }

  changeStatus(event: Event, member: RichMember, groupId?: number): void {
    event.stopPropagation();

    // Do not open expiration dialog, if caller doesn't have sufficient rights
    if (!groupId) {
      if (!this.expireVoAuth) return;
    } else if (!this.expireGroupAuth) return;

    // Skip crating the status dialog, if the current group is 'members'
    if (this.isMembersGroup && groupId) return;
    // Skip crating the status dialog, if the member is indirect or unalterable
    const indirect = isMemberIndirectString(member);
    if ((indirect === 'INDIRECT' && groupId) || (!groupId && indirect === 'UNALTERABLE')) return;

    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { member: member, voId: this.voId, groupId: groupId };
    const oldStatus = groupId ? member.groupStatus : member.status;

    const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
    dialogRef.afterClosed().subscribe((changedMember: Member) => {
      if (changedMember) {
        const changedStatus: string = groupId ? changedMember.groupStatus : changedMember.status;
        if (
          (oldStatus === 'VALID' &&
            (changedStatus === 'EXPIRED' || changedStatus === 'DISABLED')) ||
          changedStatus === 'VALID'
        ) {
          if (groupId) {
            member.groupStatus = changedStatus;
          } else {
            member.status = changedStatus;
          }
          this.changeExpiration(member, groupId);
        } else {
          this.loadMembersPage();
        }
      }
    });
  }

  changeExpiration(member: RichMember, groupId?: number): void {
    const expirationAttr = groupId
      ? member.memberAttributes.find((att) => att.friendlyName === 'groupMembershipExpiration')
      : member.memberAttributes.find((att) => att.friendlyName === 'membershipExpiration');
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      voId: this.voId,
      groupId: groupId,
      memberId: member.id,
      expirationAttr: expirationAttr,
      status: groupId ? member.groupStatus : member.status,
      statusChanged: true,
    };
    let dialogRef: MatDialogRef<
      ChangeGroupExpirationDialogComponent | ChangeVoExpirationDialogComponent
    >;
    if (groupId) {
      dialogRef = this.dialog.open(ChangeGroupExpirationDialogComponent, config);
    } else {
      dialogRef = this.dialog.open(ChangeVoExpirationDialogComponent, config);
    }

    dialogRef.afterClosed().subscribe(() => {
      this.loadMembersPage();
    });
  }

  loadMembersPage(): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'fullName' ? 'NAME' : 'ID';
    this.dataSource.loadMembers(
      this.voId,
      this.attrNames,
      sortDirection,
      this.child.paginator.pageIndex,
      this.child.paginator.pageSize,
      sortColumn,
      this.selectedStatuses,
      this.searchString,
      this.groupId,
      this.selectedGroupStatuses
    );
  }

  exportDisplayedData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.getData(),
        this.displayedColumns,
        MembersDynamicListComponent.getExportDataForColumn
      ),
      format
    );
  }

  exportAllData(format: string): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'fullName' ? 'NAME' : 'ID';

    const config = getDefaultDialogConfig();
    config.width = '300px';
    const exportLoading = this.dialog.open(ExportDataDialogComponent, config);

    this.dataSource
      .getAllMembers(
        this.voId,
        this.attrNames,
        sortDirection,
        this.child.paginator.length,
        sortColumn,
        this.selectedStatuses,
        this.searchString,
        this.groupId,
        this.selectedGroupStatuses
      )
      .subscribe((response) => {
        exportLoading.close();
        downloadData(
          getDataForExport(
            response,
            this.displayedColumns,
            MembersDynamicListComponent.getExportDataForColumn
          ),
          format
        );
      });
  }

  viewMemberGroupTree(event: Event, member: RichMember): void {
    event.stopPropagation();
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = { member: member, groupId: this.groupId };

    this.dialog.open(MemberTreeViewDialogComponent, config);
  }
}
