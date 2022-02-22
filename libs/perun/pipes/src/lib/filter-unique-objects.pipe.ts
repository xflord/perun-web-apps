import { Pipe, PipeTransform } from '@angular/core';
import { Destination, Host } from '@perun-web-apps/perun/openapi';

type FacilityObjects = Host | Destination;

@Pipe({
  name: 'filterUniqueObjects',
})
export class FilterUniqueObjectsPipe implements PipeTransform {
  /**
   *  Returns array of unique objects according to one of their attribute, that also match the filter
   */
  transform(destinations: FacilityObjects[], filter: string, paramName: string): FacilityObjects[] {
    return destinations
      .filter((d) => {
        const value: string = d[paramName] as string;
        return value.includes(filter);
      })
      .filter((dest, i, arr) => arr.findIndex((d) => d[paramName] === dest[paramName]) === i);
  }
}
