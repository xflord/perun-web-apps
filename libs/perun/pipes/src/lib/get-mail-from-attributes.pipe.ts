import { Pipe, PipeTransform } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'getMailFromAttributes',
})
export class GetMailFromAttributesPipe implements PipeTransform {
  transform(attributes: Attribute[]): string {
    const attribute = attributes.find((att) => att.friendlyName === 'mail');
    return (attribute?.value as string) ?? '';
  }
}
