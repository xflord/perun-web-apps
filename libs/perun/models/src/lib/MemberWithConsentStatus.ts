import { RichMember } from '@perun-web-apps/perun/openapi';

export interface MemberWithConsentStatus extends RichMember {
  consent?: string;
}
