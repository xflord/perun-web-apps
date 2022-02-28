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
  loading = false;
  filterValue = '';
  tableId = TABLE_RESOURCE_MEMBERS;

  resource: Resource;
  members: RichMember[];

  routeAuth: boolean;

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourcesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resource = this.entityStorageService.getEntity();
    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.resourceService.getAssignedRichMembers(this.resource.id).subscribe((members) => {
      this.members = members;
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights(): void {
    if (this.members.length !== 0) {
      this.routeAuth = this.authResolver.isAuthorized('getMemberById_int_policy', [
        this.members[0],
      ]);
    }
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
