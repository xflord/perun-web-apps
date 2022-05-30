import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import {
  Attribute,
  Candidate,
  Group,
  MemberCandidate,
  RichUser,
} from '@perun-web-apps/perun/openapi';
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
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import { MemberTypePipe } from '../../pipes/member-type.pipe';

@Component({
  selector: 'app-members-candidates-list',
  templateUrl: './members-candidates-list.component.html',
  styleUrls: ['./members-candidates-list.component.scss'],
  providers: [
    {
      provide: MemberTypePipe,
    },
  ],
})
export class MembersCandidatesListComponent implements OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input()
  members: MemberCandidate[];
  @Input()
  selection: SelectionModel<MemberCandidate>;
  @Input()
  type: string;
  @Input()
  tableId: string;
  @Input()
  group: Group;
  @Input()
  blockManualAdding = false;
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
  addAuth = false;
  private sort: MatSort;

  constructor(
    private guiAuthResolver: GuiAuthResolver,
    private memberTypePipe: MemberTypePipe,
    private tableCheckbox: TableCheckbox,
    private cd: ChangeDetectorRef
  ) {}

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  getDataForColumnFun = (data: MemberCandidate, column: string): string =>
    this.getDataForColumn(data, column, this.type);

  getExportDataForColumnFun = (data: MemberCandidate, column: string): string =>
    this.getExportDataForColumn(data, column, this.type);

  getDataForColumn(data: MemberCandidate, column: string, type: string): string {
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
        return this.memberTypePipe.transform(data, type);
      case 'local':
        return data.richUser ? 'Local' : 'External identity';
      default:
        return data[column] as string;
    }
  }

  getExportDataForColumn(data: MemberCandidate, column: string, type: string): string {
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
        return this.memberTypePipe.transform(data, type);
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
    if (this.child === null || this.child === undefined || !this.child.paginator) {
      return;
    }
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

  ngAfterViewInit(): void {
    this.cd.detectChanges();
    this.setDataSource();
    this.setAddAuth();
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<MemberCandidate>(this.members);

    this.setDataSource();
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

  isCheckboxDisabled(memberCandidate: MemberCandidate): boolean {
    if (this.type === 'vo') {
      return memberCandidate.member != null;
    } else {
      if (memberCandidate.member) {
        return (
          memberCandidate.member.sourceGroupId !== 0 &&
          memberCandidate.member.membershipType === 'DIRECT'
        );
      }
    }
    return this.blockManualAdding;
  }

  setAddAuth(): void {
    if (this.group !== undefined && this.selection.selected.length !== 0) {
      if (this.selection.selected.every((selected) => selected.member)) {
        this.addAuth = true;
      } else {
        this.addAuth =
          this.guiAuthResolver.isAuthorized('createMember_Vo_User_List<Group>_policy', [
            this.group,
          ]) &&
          this.guiAuthResolver.isAuthorized('createMember_Vo_Candidate_List<Group>_policy', [
            this.group,
          ]);
      }
    }
  }

  itemSelectionToggle(item: MemberCandidate): void {
    this.selection.toggle(item);
    this.setAddAuth();
  }

  getTooltip(memberCandidate: MemberCandidate): string {
    return memberCandidate.member
      ? 'MEMBERS_CANDIDATES_LIST.ALREADY_MEMBER'
      : 'MEMBERS_CANDIDATES_LIST.ADDING_BLOCKED';
  }

  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelected(
      this.selection.selected.length,
      '',
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.dataSource
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
      false
    );
    this.setAddAuth();
  }

  checkboxLabel(selected?: MemberCandidate): string {
    if (!selected) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(selected) ? 'deselect' : 'select'}`;
  }
}
