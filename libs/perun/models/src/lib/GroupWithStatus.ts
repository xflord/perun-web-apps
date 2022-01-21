import { GroupResourceStatus, RichGroup } from '@perun-web-apps/perun/openapi';

export interface GroupWithStatus extends RichGroup {
  autoAssignSubgroups?: boolean;
  status?: GroupResourceStatus;
  failureCause?: string;
  sourceGroupId?: number;
  moreTypesOfAssignment?: boolean;
}
