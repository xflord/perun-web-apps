import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_FACILITY_ALLOWED_USERS, TableConfigService } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { FacilitiesManagerService, Facility, User } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-allowed-users',
  templateUrl: './facility-allowed-users.component.html',
  styleUrls: ['./facility-allowed-users.component.scss']
})
export class FacilityAllowedUsersComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private facilityService: FacilitiesManagerService,
    private tableConfigService: TableConfigService,
    private authResolver: GuiAuthResolver) { }

  loading = false;
  filterValue = '';

  facilityId: number;
  facility: Facility;
  users: User[];

  pageSize: number;
  tableId = TABLE_FACILITY_ALLOWED_USERS;

  routeAuth: boolean;


  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(params => {
      this.facilityId = params['facilityId'];
      this.routeAuth = this.authResolver.isPerunAdminOrObserver();
      this.refreshTable();
    });
  }

  refreshTable(){
    this.loading = true;
    this.facilityService.getAssignedUsers(this.facilityId).subscribe(users => {
      this.users = users;
      this.loading = false;
    });
  }


  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

}
