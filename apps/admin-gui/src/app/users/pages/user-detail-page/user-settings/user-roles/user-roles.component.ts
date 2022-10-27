import { Component, HostBinding, OnInit } from '@angular/core';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { StoreService, RoleService } from '@perun-web-apps/perun/services';
import { iif, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
})
export class UserRolesComponent implements OnInit {
  @HostBinding('class.router-component') true;

  userId: number;

  roles = new Map<string, Map<string, number[]>>();
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
    this.roles.clear();
    of(this.entityType)
      .pipe(
        mergeMap((type) =>
          iif(
            () => type === 'SELF',
            of(this.store.getPerunPrincipal().roles),
            this.authzResolverService.getUserRoles(this.userId)
          )
        )
      )
      .subscribe((roles) => {
        const roleNames = Object.keys(roles).map((role) => role.toUpperCase());
        this.roles = this.roleService.prepareRoles(roles, roleNames);
        this.outerLoading = false;
      });
  }
}
