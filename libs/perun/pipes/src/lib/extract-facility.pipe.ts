import { Pipe, PipeTransform } from '@angular/core';
import { EnrichedFacility, Facility } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'extractFacility',
})
export class ExtractFacilityPipe implements PipeTransform {
  transform(enrichedFacilities: EnrichedFacility[]): Facility[] {
    return enrichedFacilities.map((ef) => ef.facility);
  }
}
