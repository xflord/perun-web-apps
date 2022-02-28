import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameSpaceToDef',
})
export class NameSpaceToDefPipe implements PipeTransform {
  transform(value: string): string {
    if (value === null) {
      return null;
    }

    const stringValue = value;
    return stringValue.substring(stringValue.lastIndexOf(':') + 1, stringValue.length);
  }
}
