import { Injectable } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';

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

  prepareComplementaryObjects(
    roleNames: string[],
    roleComplementaryObjectsWithAuthzGroups: {
      [p: string]: { [p: string]: { [p: string]: Group[] } };
    }
  ): Map<string, Map<string, Map<number, Group[]>>> {
    const mappedResult = new Map<string, Map<string, Map<number, Group[]>>>();
    roleNames.forEach((roleName) => {
      const beanNamesMap = new Map<string, Map<number, Group[]>>();
      const beanNames = Object.keys(roleComplementaryObjectsWithAuthzGroups[roleName]);

      beanNames.forEach((beanName) => {
        const beanIdToGroupsMap = new Map<number, Group[]>();

        // prepare all complementary objects IDs
        const compObjectsIds = Object.keys(
          roleComplementaryObjectsWithAuthzGroups[roleName][beanName]
        ).map((value) => Number(value));

        compObjectsIds.forEach((id) => {
          beanIdToGroupsMap.set(
            id,
            roleComplementaryObjectsWithAuthzGroups[roleName][beanName][id]
          );
        });
        beanNamesMap.set(beanName, beanIdToGroupsMap);
      });

      mappedResult.set(roleName, beanNamesMap);
    });
    return mappedResult;
  }
}
