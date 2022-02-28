import { Component, HostBinding, OnInit } from '@angular/core';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Group } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-group-attributes',
  templateUrl: './group-attributes.component.html',
  styleUrls: ['./group-attributes.component.scss'],
})
export class GroupAttributesComponent implements OnInit {
  @HostBinding('class.router-component') true;
  group: Group;
  groupResourceAttAuth: boolean;
  groupMemberAttAuth: boolean;

  constructor(
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.group = this.entityStorageService.getEntity();
    this.groupResourceAttAuth = this.authResolver.isAuthorized(
      'getResourceAssignments_Group_policy',
      [this.group]
    );
    this.groupMemberAttAuth = this.authResolver.isAuthorized(
      'getCompleteRichMembers_Group_List<String>_List<String>_List<String>_boolean_policy',
      [this.group]
    );
  }
}
