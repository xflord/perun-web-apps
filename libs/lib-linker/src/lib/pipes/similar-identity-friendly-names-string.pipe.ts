import { Pipe, PipeTransform } from '@angular/core';
import { EnrichedExtSource } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'similarIdentityFriendlyNamesString',
})
export class SimilarIdentityFriendlyNamesStringPipe implements PipeTransform {
  transform(extSources: EnrichedExtSource[]): string {
    let stringOfIdentities = '';
    extSources.forEach((extSource) => {
      const attributes = extSource.attributes;
      if (attributes) {
        const friendlyName = attributes['sourceIdPName'];
        if (friendlyName && friendlyName !== '') {
          stringOfIdentities = stringOfIdentities + friendlyName + ', ';
        }
      }
    });
    return stringOfIdentities.slice(0, -2);
  }
}
