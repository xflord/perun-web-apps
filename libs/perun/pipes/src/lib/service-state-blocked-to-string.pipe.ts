import { Pipe, PipeTransform } from '@angular/core';
import { ServiceState } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'serviceStateBlockedToString'
})
export class ServiceStateBlockedToStringPipe implements PipeTransform {

  transform(value: ServiceState): string {
    if (value.blockedOnFacility) { return 'BLOCKED' }
    if (value.blockedGlobally) {return 'BLOCKED GLOBALLY'}
    return 'ALLOWED';
  }
}
