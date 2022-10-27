import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  prepareRoles(
    roles: { [p: string]: { [p: string]: number[] } },
    names: string[]
  ): Map<string, Map<string, number[]>> {
    const preparedRoles = new Map<string, Map<string, number[]>>();
    names.forEach((roleName) => {
      const innerMap = new Map<string, Array<number>>();
      const innerRoles = Object.keys(roles[roleName]);

      innerRoles.forEach((innerRole) => {
        innerMap.set(innerRole, roles[roleName][innerRole]);
      });

      preparedRoles.set(roleName, innerMap);
    });
    return preparedRoles;
  }
}
