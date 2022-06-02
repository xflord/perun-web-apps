import { Component, OnInit } from '@angular/core';
import {
  Member,
  MembersManagerService,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  TABLE_MEMBER_APPLICATIONS_DETAILED,
  TABLE_MEMBER_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-applications',
  templateUrl: './member-applications.component.html',
  styleUrls: ['./member-applications.component.scss'],
})
export class MemberApplicationsComponent implements OnInit {
  loading = false;
  memberId: number;
  member: Member;
  displayedColumns: string[] = [
    'id',
    'createdAt',
    'type',
    'state',
    'user',
    'groupName',
    'modifiedBy',
  ];
  detailedDisplayedColumns: string[] = [
    'id',
    'createdAt',
    'voId',
    'voName',
    'groupId',
    'groupName',
    'type',
    'state',
    'extSourceName',
    'extSourceType',
    'user',
    'createdBy',
    'modifiedBy',
    'modifiedAt',
    'fedInfo',
  ];
  filterValue = '';
  showAllDetails = false;
  detailTableId = TABLE_MEMBER_APPLICATIONS_DETAILED;
  tableId = TABLE_MEMBER_APPLICATIONS_NORMAL;
  dateFrom: Date = new Date('1970-01-01');
  refresh: boolean;

  constructor(
    private registrarManager: RegistrarManagerService,
    private memberManager: MembersManagerService,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe((parentParams) => {
      this.memberId = Number(parentParams['memberId']);

      this.memberManager.getMemberById(this.memberId).subscribe((member) => {
        this.member = member;
        this.loading = false;
      });
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
