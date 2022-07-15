import { Pipe, PipeTransform } from '@angular/core';
import { findAttribute } from '@perun-web-apps/perun/utils';
import { Attribute } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'findAttribute',
})
export class FindAttributePipe implements PipeTransform {
  transform(attributes: Attribute[], friendlyName: string): string {
    return findAttribute(attributes, friendlyName);
  }
}
