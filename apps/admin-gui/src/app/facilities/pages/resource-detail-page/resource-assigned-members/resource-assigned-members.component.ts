import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resource, ResourcesManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { TABLE_RESOURCE_MEMBERS } from '@perun-web-apps/config/table-config';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-resource-assigned-members',
  templateUrl: './resource-assigned-members.component.html',
  styleUrls: ['./resource-assigned-members.component.scss'],
})
export class ResourceAssignedMembersComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourcesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  loading = false;
  filterValue = '';
  tableId = TABLE_RESOURCE_MEMBERS;

  resource: Resource;
  members: RichMember[];

  routeAuth: boolean;

  ngOnInit(): void {
    this.loading = true;
    this.resource = this.entityStorageService.getEntity();
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.resourceService.getAssignedRichMembers(this.resource.id).subscribe((members) => {
      this.members = members;
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights() {
    if (this.members.length !== 0) {
      this.routeAuth = this.authResolver.isAuthorized('getMemberById_int_policy', [
        this.members[0],
      ]);
    }
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
