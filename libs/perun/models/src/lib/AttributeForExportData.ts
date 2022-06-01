import { AttributeDefinition, AttributePolicyCollection } from '@perun-web-apps/perun/openapi';

export interface AttributeForExportData {
  attributeDefinition: AttributeDefinition;
  attributeRights: AttributePolicyCollection[];
}
