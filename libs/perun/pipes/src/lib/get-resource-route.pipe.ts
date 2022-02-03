import { Pipe, PipeTransform } from '@angular/core';
import { RichResource } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'getResourceRoute',
  pure: true,
})
export class GetResourceRoutePipe implements PipeTransform {
  transform(resource: RichResource, routingVo: boolean): string {
    // return routingVo ? ['/organizations', resource.voId, 'resources', resource.id] : ['/facilities', resource.facilityId, 'resources', resource.id];
    return routingVo
      ? `/organizations/${resource.voId}/resources/${resource.id}`
      : `/facilities/${resource.facilityId}/resources/${resource.id}`;
  }
}
