import { Pipe, PipeTransform } from '@angular/core';
import { User } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'userFullName',
})
export class UserFullNamePipe implements PipeTransform {
  transform<T extends User>(value: T): string {
    const nameParts: string[] = [
      value.titleBefore,
      value.firstName,
      value.middleName,
      value.lastName,
      value.titleAfter,
    ];

    return nameParts.join(' ');
  }
}
