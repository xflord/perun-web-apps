import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiWordDataCy',
})
export class MultiWordDataCyPipe implements PipeTransform {
  transform(value: string): unknown {
    return value.replace(/\s/g, '-').toLowerCase();
  }
}
