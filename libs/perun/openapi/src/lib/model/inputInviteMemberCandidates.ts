import { MemberCandidate } from '@perun-web-apps/perun/openapi';

export interface InputInviteMemberCandidates {
  vo: number;
  candidates: Array<MemberCandidate>;
  group?: number;
  lang: string;
}
