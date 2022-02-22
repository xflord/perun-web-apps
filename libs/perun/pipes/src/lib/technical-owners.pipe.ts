import { Pipe, PipeTransform } from '@angular/core';
import { parseTechnicalOwnersNames } from '@perun-web-apps/perun/utils';
import { Owner } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'technicalOwners',
})
export class TechnicalOwnersPipe implements PipeTransform {
  transform(value: Owner[]): string {
    return parseTechnicalOwnersNames(value);
  }
}
