import { Component, OnInit } from '@angular/core';
import {
  Application,
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
  constructor(
    private registrarManager: RegistrarManagerService,
    private memberManager: MembersManagerService,
    protected route: ActivatedRoute
  ) {}

  loading = false;
  applications: Application[] = [];
  memberId: number;
  member: Member;
  displayedColumns: string[] = ['id', 'createdAt', 'type', 'state', 'user', 'group', 'modifiedBy'];
  filterValue = '';
  showAllDetails = false;
  detailTableId = TABLE_MEMBER_APPLICATIONS_DETAILED;
  tableId = TABLE_MEMBER_APPLICATIONS_NORMAL;

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe((parentParams) => {
      this.memberId = parentParams['memberId'];

      this.memberManager.getMemberById(this.memberId).subscribe((member) => {
        this.member = member;
      });

      this.registrarManager.getApplicationsForMember(this.memberId).subscribe((applications) => {
        this.applications = applications;
        this.loading = false;
      });
    });
  }

  refreshTable() {
    this.loading = true;
    this.registrarManager.getApplicationsForMember(this.memberId).subscribe((applications) => {
      this.applications = applications;
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
