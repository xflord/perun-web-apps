import { Pipe, PipeTransform } from '@angular/core';
import { EnrichedFacility, Facility } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'toEnrichedFacility',
})
export class ToEnrichedFacilityPipe implements PipeTransform {
  transform(facilities: Facility[]): EnrichedFacility[] {
    return facilities.map((fac) => {
      const ef: EnrichedFacility = {
        facility: fac,
      };
      return ef;
    });
  }
}
