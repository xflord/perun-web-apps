import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Attribute, Candidate, MemberCandidate, RichUser } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getCandidateEmail,
  getDataForExport,
  getExtSourceNameOrOrganizationColumn,
  parseFullName,
  parseUserEmail,
  parseVo,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { TableCheckbox } from '@perun-web-apps/perun/services';
import { MemberTypePipe } from '../../pipes/member-type.pipe';
import { DisabledCandidatePipe } from '../../pipes/disabled-candidate.pipe';

@Component({
  selector: 'app-members-candidates-list',
  templateUrl: './members-candidates-list.component.html',
  styleUrls: ['./members-candidates-list.component.scss'],
  providers: [MemberTypePipe, DisabledCandidatePipe],
})
export class MembersCandidatesListComponent implements OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input() members: MemberCandidate[];
  @Input() selection: SelectionModel<MemberCandidate>;
  @Input() tableId: string;
  @Input() blockManualAdding = false;
  displayedColumns: string[] = [
    'checkbox',
    'status',
    'fullName',
    'voExtSource',
    'email',
    'logins',
    'alreadyMember',
    'local',
  ];
  dataSource: MatTableDataSource<MemberCandidate>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  private sort: MatSort;

  constructor(
    private memberTypePipe: MemberTypePipe,
    private disabledCandidatePipe: DisabledCandidatePipe,
    private tableCheckbox: TableCheckbox
  ) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<MemberCandidate>(this.members);
    this.setDataSource();
  }

  canBeSelected = (row: MemberCandidate): boolean =>
    !this.disabledCandidatePipe.transform(row, this.blockManualAdding);

  getDataForColumnFun = (data: MemberCandidate, column: string): string =>
    this.getDataForColumn(data, column);

  getExportDataForColumnFun = (data: MemberCandidate, column: string): string =>
    this.getExportDataForColumn(data, column);

  getDataForColumn(data: MemberCandidate, column: string): string {
    switch (column) {
      case 'status':
        return data.member ? data.member.status ?? '' : '';
      case 'fullName': {
        const user = data.richUser ? data.richUser : data.candidate;
        return user.lastName ? user.lastName : user.firstName ?? '';
      }
      case 'voExtSource':
        return data.richUser
          ? parseVo(data.richUser)
          : getExtSourceNameOrOrganizationColumn(data.candidate);
      case 'email':
        if (data.richUser || data.member) {
          return parseUserEmail(data.richUser);
        }
        return this.getEmail(data);
      case 'logins':
        return this.getLogins(data);
      case 'alreadyMember':
        return this.memberTypePipe.transform(data);
      case 'local':
        return data.richUser ? 'Local' : 'External identity';
      default:
        return data[column] as string;
    }
  }

  getExportDataForColumn(data: MemberCandidate, column: string): string {
    switch (column) {
      case 'status':
        return data.member ? data.member.status ?? '' : '';
      case 'fullName': {
        const user = data.richUser ? data.richUser : data.candidate;
        return parseFullName(user);
      }
      case 'voExtSource':
        return data.richUser
          ? parseVo(data.richUser)
          : getExtSourceNameOrOrganizationColumn(data.candidate);
      case 'email':
        if (data.richUser || data.member) {
          return parseUserEmail(data.richUser);
        }
        return this.getEmail(data);
      case 'logins':
        return this.getLogins(data);
      case 'alreadyMember':
        return this.memberTypePipe.transform(data);
      case 'local':
        return data.richUser ? 'Local' : 'External identity';
      default:
        return data[column] as string;
    }
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        this.getExportDataForColumnFun
      ),
      format
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;

      this.dataSource.filterPredicate = (data: MemberCandidate, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          this.getDataForColumnFun
        );
      this.dataSource.sortData = (data: MemberCandidate[], sort: MatSort): MemberCandidate[] =>
        customDataSourceSort(data, sort, this.getDataForColumnFun);
      this.dataSource.paginator = this.child.paginator;
    }
  }

  getEmail(memberCandidate: MemberCandidate): string {
    let email: Attribute;
    if (memberCandidate.richUser) {
      for (const attribute of memberCandidate.richUser.userAttributes) {
        if (
          attribute.namespace + ':' + attribute.friendlyName ===
          'urn:perun:user:attribute-def:def:preferredMail'
        ) {
          email = attribute;
          break;
        }
      }
      if (email?.value != null) {
        return (email.value as string).replace(',', ' ');
      }
      return '';
    } else {
      return getCandidateEmail(memberCandidate.candidate);
    }
  }

  getOrganization(candidate: Candidate): string {
    return getExtSourceNameOrOrganizationColumn(candidate);
  }

  /**
   * Gets all logins stored in user attributes
   *
   * @return users logins
   */
  getLogins(memberCandidate: MemberCandidate): string {
    if (memberCandidate.richUser) {
      return this.getLoginsForRichUser(memberCandidate.richUser);
    } else {
      let logins = this.getLoginsForCandidate(memberCandidate.candidate);
      if (logins == null || logins === '') {
        logins = memberCandidate.candidate.userExtSource.login;
      }
      return logins;
    }
  }

  getLoginsForRichUser(user: RichUser): string {
    let logins = '';
    for (const userAttribute of user.userAttributes) {
      if (userAttribute.friendlyName.startsWith('login-namespace')) {
        // process only logins which are not null
        if (userAttribute.value != null) {
          // append comma
          if (logins.length > 0) {
            logins += ', ';
          }
          // parse login namespace
          const parsedNamespace: string = userAttribute.friendlyName.substring(16);
          logins += parsedNamespace + ': ' + (userAttribute.value as string);
        }
      }
    }
    return logins;
  }

  getLoginsForCandidate(candidate: Candidate): string {
    const attributesNamespace = 49;
    let logins = '';
    for (const prop in candidate.attributes) {
      if (Object.prototype.hasOwnProperty.call(candidate.attributes, prop)) {
        if (prop.includes('urn:perun:user:attribute-def:def:login-namespace:')) {
          if (candidate.attributes[prop] != null) {
            if (logins.length > 0) {
              logins += ', ';
            }
            // parse login namespace
            const parsedNamespace = prop.substring(attributesNamespace);
            logins += parsedNamespace + ': ' + candidate.attributes[prop];
          }
        }
      }
    }
    return logins;
  }

  itemSelectionToggle(item: MemberCandidate): void {
    this.selection.toggle(item);
  }

  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelectedWithDisabledCheckbox(
      this.selection.selected.length,
      '',
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.child.paginator.pageIndex,
      this.dataSource,
      this.sort,
      this.canBeSelected
    );
  }

  masterToggle(): void {
    this.tableCheckbox.masterToggle(
      this.isAllSelected(),
      this.selection,
      '',
      this.dataSource,
      this.sort,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      true,
      this.canBeSelected
    );
  }

  checkboxLabel(selected?: MemberCandidate): string {
    if (!selected) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(selected) ? 'deselect' : 'select'}`;
  }
}
