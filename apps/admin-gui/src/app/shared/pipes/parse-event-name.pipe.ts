import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseEventName',
})
export class ParseEventNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return;
    return value.split('.').pop();
  }
}
