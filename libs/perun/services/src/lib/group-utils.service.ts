import { Injectable } from '@angular/core';
import { GroupWithStatus } from '@perun-web-apps/perun/models';
import { getGroupExpiration, parseDate } from '@perun-web-apps/perun/utils';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GroupUtilsService {
  getDataForColumn: (
    data: GroupWithStatus,
    column: string,
    voNames?: Map<number, string>,
  ) => string = (data, column, voNames) => {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return voNames.get(data.voId);
      case 'name':
        return data.name;
      case 'description':
        return data.description;
      case 'expiration': {
        const expirationStr = getGroupExpiration(data);
        return parseDate(expirationStr);
      }
      case 'recent':
        return '';
      case 'status':
        return data.status;
      case 'uuid':
        return data.uuid;
      default:
        return data[column] as string;
    }
  };

  getSortDataForColumn: (
    data: GroupWithStatus,
    column: string,
    voNames: Map<number, string>,
    recentIds: number[],
  ) => string = (data, column, voNames, recentIds) => {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return voNames.get(data.voId);
      case 'name':
        return data.name;
      case 'description':
        return data.description;
      case 'expiration': {
        const expirationStr = getGroupExpiration(data);
        if (!expirationStr || expirationStr.toLowerCase() === 'never') {
          return expirationStr;
        }
        return formatDate(expirationStr, 'yyyy.MM.dd', 'en');
      }
      case 'recent':
        if (recentIds) {
          if (recentIds.includes(data.id)) {
            return '#'.repeat(recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      case 'status':
        return data.status;
      default:
        return data[column] as string;
    }
  };
}
