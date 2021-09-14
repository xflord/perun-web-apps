import { GroupResourceStatus, RichGroup } from '@perun-web-apps/perun/openapi';

export interface GroupWithStatus extends RichGroup {
  status?: GroupResourceStatus;
  failureCause?: string;
}
