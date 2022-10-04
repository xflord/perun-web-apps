import { Pipe, PipeTransform } from '@angular/core';
import { Consent, RichUser } from '@perun-web-apps/perun/openapi';

@Pipe({ name: 'consentStatusIcon' })
export class ConsentStatusIconPipe implements PipeTransform {
  transform(user: RichUser, consents: Consent[]): string {
    if (!consents || consents.length === 0) return;
    const usersConsents = consents.filter((consent) => consent.userId === user.id);
    // return latest consent (one with the highest id)
    if (usersConsents.length === 0) return;
    return usersConsents.reduce((a, b) => (a.id > b.id ? a : b)).status;
  }
}
