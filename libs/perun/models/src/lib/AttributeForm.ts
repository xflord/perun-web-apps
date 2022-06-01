export type AttributeEntity =
  | 'facility'
  | 'resource'
  | 'group'
  | 'group_resource'
  | 'host'
  | 'member'
  | 'member_group'
  | 'member_resource'
  | 'user'
  | 'ues'
  | 'user_facility'
  | 'vo'
  | 'entityless';

export type AttributeDefinitionType = 'def' | 'opt' | 'virt' | 'core';

export type AttributeValueType =
  | 'java.lang.String'
  | 'java.lang.Integer'
  | 'java.lang.Boolean'
  | 'java.util.Array'
  | 'java.util.LinkedHashMap';

export interface AttributeForm {
  friendlyName: string;
  displayName: string;
  description: string;
  entity: AttributeEntity;
  definitionType: AttributeDefinitionType;
  valueType: AttributeValueType;
}
