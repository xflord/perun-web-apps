import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'attributeTypeClean',
})
export class AttributeTypeCleanPipe implements PipeTransform {
  transform(value: string): string {
    if (value === null) {
      return null;
    }

    const stringValue = value;
    return stringValue.substring(stringValue.lastIndexOf('.') + 1, stringValue.length);
  }
}
