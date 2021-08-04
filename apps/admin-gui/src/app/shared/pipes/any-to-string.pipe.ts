import {Pipe, PipeTransform} from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'anyToString'
})
export class AnyToStringPipe implements PipeTransform {

  transform(attribute: Attribute): string {
    if (attribute.value === undefined) {
      return '';
    }
    switch (attribute.type) {
      case 'java.lang.String': {
        return <string><unknown>attribute.value;
      }
      case 'java.lang.Integer': {
        return attribute.value.toString();
      }
      case 'java.util.ArrayList': {
        return this.whenValueIsArray(<string[]>attribute.value);
      }
      case 'java.util.LinkedHashMap': {
        return this.whenValueIsMap(<Map<string, string>>attribute.value);
      }
      case 'java.lang.Boolean': {
        return attribute.value.toString();
      }
      default: {
        return <string><unknown>attribute.value;
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
