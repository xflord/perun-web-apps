import { Component, HostBinding, OnInit } from '@angular/core';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, RoleService } from '@perun-web-apps/perun/services';

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
  roles = new Map<string, Map<string, number[]>>();

  constructor(
    private authzResolverService: AuthzResolverService,
    private entityStorageService: EntityStorageService,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.groupId = this.entityStorageService.getEntity().id;
    this.getData();
  }

  getData(): void {
    this.outerLoading = true;
    this.roles.clear();
    this.authzResolverService.getGroupRoles(this.groupId).subscribe((roles) => {
      const roleNames = Object.keys(roles).map((role) => role.toUpperCase());
      this.roles = this.roleService.prepareRoles(roles, roleNames);
      this.outerLoading = false;
    });
  }
}
