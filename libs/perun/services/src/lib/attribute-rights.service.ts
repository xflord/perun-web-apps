import { Injectable } from '@angular/core';
import {
  AttributePolicyCollection,
  AuthzResolverService,
  RoleManagementRules,
  RoleObject,
} from '@perun-web-apps/perun/openapi';
import { map, switchMap } from 'rxjs/operators';
import { Role } from '@perun-web-apps/perun/models';
import { Observable, of, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttributeRightsService {
  private roleWithObjects$ = new ReplaySubject<Map<Role, RoleObject[]>>(1);

  constructor(private authService: AuthzResolverService) {
    this.authService
      .getAllRolesManagementRules()
      .pipe(
        map((rules) => rules.filter((rule) => rule.assignableToAttributes)),
        switchMap((rules: RoleManagementRules[]) => {
          const roleWithObject = new Map<Role, RoleObject[]>();
          rules.map((rule) =>
            roleWithObject.set(
              rule.roleName as Role,
              ['None', ...Object.keys(rule.assignedObjects)] as RoleObject[]
            )
          );
          // sort the map by key
          return of(new Map<Role, RoleObject[]>([...roleWithObject.entries()].sort()));
        })
      )
      .subscribe(this.roleWithObjects$);
  }

  getRoles(): Observable<Role[]> {
    return this.roleWithObjects$.pipe(
      switchMap((rwo) => {
        return of(Array.from(rwo.keys()));
      })
    );
  }

  getObjects(role: Role): Observable<RoleObject[]> {
    return this.roleWithObjects$.pipe(switchMap((rwo) => of(rwo.get(role))));
  }

  /**
   * Operator - filters out invalid policies from collections
   */
  filterNullInPolicy() {
    return function (
      source: Observable<AttributePolicyCollection[]>
    ): Observable<AttributePolicyCollection[]> {
      return source.pipe(
        map((collections) => {
          collections.forEach(
            (col) =>
              (col.policies = col.policies.filter(
                (policy) => policy.role !== null && policy.object !== null
              ))
          );
          return collections;
        })
      );
    };
  }

  /**
   * Operator - adds attribute id to all collections
   */
  addAttributeId() {
    return function (
      source: Observable<[number, AttributePolicyCollection[]]>
    ): Observable<AttributePolicyCollection[]> {
      return source.pipe(
        map(([id, collections]) => {
          collections.forEach((col) => (col.attributeId = id));
          return collections;
        })
      );
    };
  }
}
