import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'publicationTabLabel',
})
export class PublicationTabLabelPipe implements PipeTransform {
  transform(value: string): string {
    return value.length > 50 ? value.substring(0, 50) + '...' : value;
  }
}
