import { GroupResourceStatus, RichResource } from '@perun-web-apps/perun/openapi';

export interface ResourceWithStatus extends RichResource {
  status?: GroupResourceStatus;
  failureCause?: string;
  sourceGroupId?: number;
}
