import { RichUser } from '@perun-web-apps/perun/openapi';

export interface UserWithConsentStatus extends RichUser {
  consent?: string;
}
