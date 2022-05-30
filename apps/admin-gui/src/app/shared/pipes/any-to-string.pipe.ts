import { Pipe, PipeTransform } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'anyToString',
})
export class AnyToStringPipe implements PipeTransform {
  transform(attribute: Attribute): string {
    if (attribute.value === undefined) {
      return '';
    }
    switch (attribute.type) {
      case 'java.lang.String': {
        return attribute.value as string;
      }
      case 'java.lang.Integer': {
        return String(attribute.value);
      }
      case 'java.util.ArrayList': {
        return this.whenValueIsArray(attribute.value as string[]);
      }
      case 'java.util.LinkedHashMap': {
        return this.whenValueIsMap(attribute.value as Map<string, string>);
      }
      case 'java.lang.Boolean': {
        return String(attribute.value);
      }
      default: {
        return String(attribute.value);
      }
    }
  }

  whenValueIsArray(value: Array<string>): string {
    let result = '';
    value.forEach(function (str) {
      result = result.concat(str + ', ');
    });
    return result;
  }

  whenValueIsMap(map: Map<string, string>): string {
    let result = '';
    map.forEach((value, key) => {
      result = result.concat(key + ': ' + value + ', ');
    });
    return result;
  }
}
