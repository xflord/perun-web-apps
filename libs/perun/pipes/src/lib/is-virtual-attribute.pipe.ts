import { Pipe, PipeTransform } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'isVirtualAttribute',
  pure: true,
})
export class IsVirtualAttributePipe implements PipeTransform {
  transform(attribute: Attribute): boolean {
    return attribute.namespace.split(':')[4] === 'virt';
  }
}
