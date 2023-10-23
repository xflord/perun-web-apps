import { Pipe, PipeTransform } from '@angular/core';
import { PerunTranslateService } from '@perun-web-apps/perun/services';

@Pipe({ name: 'selectedConsentStatuses' })
export class SelectedConsentStatusesPipe implements PipeTransform {
  constructor(private translateService: PerunTranslateService) {}

  transform(
    selectedConsentStatuses: string[],
    consentStatusList: string[],
    consentStatuses: string[],
  ): string {
    if (!selectedConsentStatuses || selectedConsentStatuses.length === consentStatusList.length) {
      return 'ALL';
    }
    const statuses: string[] = consentStatuses;
    if (statuses) {
      const translatedStatus = this.translateService.instant(`CONSENTS.STATUS_${statuses[0]}`);
      return `${translatedStatus}  ${
        statuses.length > 1
          ? '(+' +
            (statuses.length - 1).toString() +
            ' ' +
            (statuses.length === 2 ? 'other)' : 'others)')
          : ''
      }`;
    }
    return '';
  }
}
