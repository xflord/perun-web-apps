import { Component, HostBinding, OnInit } from '@angular/core';
import { AuthzResolverService, Group } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { StoreService, RoleService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
})
export class UserRolesComponent implements OnInit {
  @HostBinding('class.router-component') true;

  userId: number;

  roles = new Map<string, Map<string, number[]>>();
  indirectRoles = new Map<string, Map<string, number[]>>();
  rolesComplementaryObjectsWithAuthzGroups = new Map<string, Map<string, Map<number, Group[]>>>();
  outerLoading: boolean;
  showDescription = true;
  entityType: 'SELF' | 'USER';

  constructor(
    private authzResolverService: AuthzResolverService,
    private route: ActivatedRoute,
    private store: StoreService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.outerLoading = true;
    this.route.parent.params.subscribe((params) => {
      if (params['userId']) {
        this.entityType = 'USER';
        this.userId = Number(params['userId']);
      } else {
        this.userId = this.store.getPerunPrincipal().userId;
        this.entityType = 'SELF';
      }

      this.getData();
    });
  }

  getData(): void {
    this.outerLoading = true;

    // get user based roles
    this.roles.clear();
    this.authzResolverService.getUserDirectRoles(this.userId).subscribe({
      next: (roles) => {
        // prepare direct roles
        const roleNames = Object.keys(roles).map((role) => role.toUpperCase());
        this.roles = this.roleService.prepareRoles(roles, roleNames);

        // get group based roles
        this.indirectRoles.clear();
        this.authzResolverService
          .getUserRolesObtainedFromAuthorizedGroupMemberships(this.userId)
          .subscribe({
            next: (groupBasedRoles) => {
              // prepare group based roles
              const groupBasedRoleNames = Object.keys(groupBasedRoles).map((role) =>
                role.toUpperCase()
              );
              this.indirectRoles = this.roleService.prepareRoles(
                groupBasedRoles,
                groupBasedRoleNames
              );

              // get map of roles and complementary objects with authorized groups
              this.rolesComplementaryObjectsWithAuthzGroups.clear();
              this.authzResolverService
                .getRoleComplementaryObjectsWithAuthorizedGroups(this.userId)
                .subscribe({
                  next: (obtainedComplementaryObjects) => {
                    // prepare map
                    this.rolesComplementaryObjectsWithAuthzGroups =
                      this.roleService.prepareComplementaryObjects(
                        Object.keys(obtainedComplementaryObjects),
                        obtainedComplementaryObjects
                      );
                    this.outerLoading = false;
                  },
                  error: () => (this.outerLoading = false),
                });
            },
            error: () => (this.outerLoading = false),
          });
      },
      error: () => (this.outerLoading = false),
    });
  }
}
