import { Component, HostBinding, OnInit } from '@angular/core';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
})
export class UserRolesComponent implements OnInit {
  @HostBinding('class.router-component') true;

  userId: number;

  roles: Map<string, Map<string, Array<number>>> = new Map<string, Map<string, Array<number>>>();
  roleNames: string[] = [];
  outerLoading: boolean;
  showDescription: boolean;
  entityType: 'SELF' | 'USER';
  roleFilter = [
    'SELF',
    'GROUPADMIN',
    'VOADMIN',
    'RESOURCEADMIN',
    'FACILITYADMIN',
    'TOPGROUPCREATOR',
    'SPONSORSHIP',
    'SPONSOR',
    'RESOURCESELFSERVICE',
    'VOOBSERVER',
    'RESOURCEOBSERVER',
    'GROUPOBSERVER',
    'TRUSTEDFACILITYADMIN',
    'FACILITYOBSERVER',
    'PERUNADMIN',
    'PERUNOBSERVER',
    'MEMBERSHIP',
  ];

  constructor(
    private authzResolverService: AuthzResolverService,
    private route: ActivatedRoute,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.outerLoading = true;
    this.showDescription = true;
    this.route.parent.params.subscribe((params) => {
      if (params['userId']) {
        this.userId = Number(params['userId']);
        this.authzResolverService.getUserRoles(this.userId).subscribe((roles) => {
          this.roleNames = Object.keys(roles).map((role) => role.toUpperCase());
          this.entityType = 'USER';
          this.prepareRoles(roles);
        });
      } else {
        const principal = this.store.getPerunPrincipal();
        this.userId = principal.userId;
        this.roleNames = Object.keys(principal.roles);
        this.entityType = 'SELF';
        this.prepareRoles(principal.roles);
      }
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
    this.outerLoading = false;
  }
}
