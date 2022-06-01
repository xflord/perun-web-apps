import { Pipe, PipeTransform } from '@angular/core';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'disableUniqueAttribute',
})
export class DisableUniqueAttributePipe implements PipeTransform {
  transform(value: AttributeDefinition): boolean {
    return (
      value.namespace.includes('virt') ||
      value.namespace.includes('core') ||
      value.namespace.includes('entityless')
    );
  }
}
