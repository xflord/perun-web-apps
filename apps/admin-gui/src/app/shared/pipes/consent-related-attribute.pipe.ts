import { Pipe, PipeTransform } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';

@Pipe({
  name: 'consentRelatedAttribute',
})
export class ConsentRelatedAttributePipe implements PipeTransform {
  private USER_CONSENT_RELATED_ATT_NAMESPACE: string[] = [
    'urn:perun:user_facility:attribute-def',
    'urn:perun:user:attribute-def',
    'urn:perun:member:attribute-def',
    'urn:perun:member_group:attribute-def',
    'urn:perun:member_resource:attribute-def',
    'urn:perun:ues:attribute-def',
  ];

  constructor(private storeService: StoreService) {}

  transform(attNamespace: string, serviceEnabled: boolean, enforceHubConsent: boolean): boolean {
    const enforceInstanceConsent: boolean = this.storeService.get('enforce_consents') as boolean;
    if (!enforceInstanceConsent || !enforceHubConsent || !serviceEnabled) {
      return false;
    }

    // When consent is required mark consent related attributes
    return this.USER_CONSENT_RELATED_ATT_NAMESPACE.reduce(
      (acc: boolean, namespace) => acc || attNamespace.startsWith(namespace),
      false
    );
  }
}
