import { Component, HostBinding, OnInit } from '@angular/core';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-group-roles',
  templateUrl: './group-roles.component.html',
  styleUrls: ['./group-roles.component.scss'],
})
export class GroupRolesComponent implements OnInit {
  static id = 'GroupRolesComponent';

  @HostBinding('class.router-component') true;

  groupId: number;
  outerLoading: boolean;
  roleNames: string[] = [];
  roles: Map<string, Map<string, Array<number>>> = new Map<string, Map<string, Array<number>>>();
  roleFilter = [
    'SELF',
    'GROUPADMIN',
    'VOADMIN',
    'RESOURCEADMIN',
    'FACILITYADMIN',
    'TOPGROUPCREATOR',
    'SPONSOR',
    'RESOURCESELFSERVICE',
    'VOOBSERVER',
    'RESOURCEOBSERVER',
    'GROUPOBSERVER',
    'TRUSTEDFACILITYADMIN',
    'FACILITYOBSERVER',
    'PERUNADMIN',
    'PERUNOBSERVER',
  ];

  constructor(
    private authzResolverService: AuthzResolverService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.outerLoading = true;
    this.groupId = this.entityStorageService.getEntity().id;
    this.authzResolverService.getGroupRoles(this.groupId).subscribe((roles) => {
      this.roleNames = Object.keys(roles).map((role) => role.toUpperCase());
      this.prepareRoles(roles);
      this.outerLoading = false;
    });
  }

  private prepareRoles(roles: { [p: string]: { [p: string]: Array<number> } }): void {
    this.roleNames.forEach((roleName) => {
      const innerMap = new Map<string, Array<number>>();
      const innerRoles = Object.keys(roles[roleName]);

      innerRoles.forEach((innerRole) => {
        innerMap.set(innerRole, roles[roleName][innerRole]);
      });

      this.roles.set(roleName, innerMap);
    });
    this.roleNames = this.roleNames.filter((role) => !this.roleFilter.includes(role));
  }
}
