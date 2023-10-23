import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Member } from '@perun-web-apps/perun/openapi';
import {
  TABLE_MEMBER_APPLICATIONS_DETAILED,
  TABLE_MEMBER_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import { Observable, of } from 'rxjs';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-member-applications',
  templateUrl: './member-applications.component.html',
  styleUrls: ['./member-applications.component.scss'],
})
export class MemberApplicationsComponent implements OnInit {
  loading$: Observable<boolean>;
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
    private entityStorageService: EntityStorageService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading$ = of(true);
    this.member = this.entityStorageService.getEntity();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  showDetails(): void {
    this.showAllDetails = !this.showAllDetails;
    this.cd.detectChanges();
  }

  refreshTable(): void {
    this.refresh = !this.refresh;
    this.cd.detectChanges();
  }
}
