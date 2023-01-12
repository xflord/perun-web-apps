import { MemberCandidate } from '@perun-web-apps/perun/openapi';

export interface InputAddMemberCandidates {
  vo: number;
  candidates: Array<MemberCandidate>;
  group?: number;
}
