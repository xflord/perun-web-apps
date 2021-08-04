import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourcesManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_RESOURCE_MEMBERS, TableConfigService } from '@perun-web-apps/config/table-config';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-resource-assigned-members',
  templateUrl: './resource-assigned-members.component.html',
  styleUrls: ['./resource-assigned-members.component.scss']
})
export class ResourceAssignedMembersComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private resourceService: ResourcesManagerService,
              private tableConfigService: TableConfigService,
              private authResolver: GuiAuthResolver) { }

  loading = false;
  filterValue = '';

  pageSize: number;
  tableId = TABLE_RESOURCE_MEMBERS;

  resourceId: number;
  members: RichMember[];

  routeAuth: boolean;


  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(params => {
      this.resourceId = params['resourceId'];
      this.refreshTable();
    });
  }

  refreshTable(){
    this.loading = true;
    this.resourceService.getAssignedRichMembers(this.resourceId).subscribe(members => {
      this.members = members;
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights(){
    if(this.members.length !== 0){
      this.routeAuth = this.authResolver.isAuthorized('getMemberById_int_policy', [this.members[0]]);
    }
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
