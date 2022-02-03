import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extSourceType',
})

/**
 * removes first 40 characters from string - 'cz.metacentrum.perun.core.impl.ExtSource'
 */
export class ExtSourceTypePipe implements PipeTransform {
  transform(type: string): string {
    return type.substring(40);
  }
}
