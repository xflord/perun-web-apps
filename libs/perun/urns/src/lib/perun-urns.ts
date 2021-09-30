export class Urns {
  // Member
  static MEMBER_DEF_EXPIRATION = 'urn:perun:member:attribute-def:def:membershipExpiration';
  static MEMBER_DEF_GROUP_EXPIRATION =
    'urn:perun:member_group:attribute-def:def:groupMembershipExpiration';
  static MEMBER_GROUP_STATUS = 'urn:perun:member_group:attribute-def:virt:groupStatus';
  static MEMBER_DEF_ORGANIZATION = 'urn:perun:member:attribute-def:def:organization';
  static MEMBER_DEF_MAIL = 'urn:perun:member:attribute-def:def:mail';
  static MEMBER_CORE_ID = 'urn:perun:member:attribute-def:core:id';
  static MEMBER_LIFECYCLE_ALTERABLE = 'urn:perun:member:attribute-def:virt:isLifecycleAlterable';

  // Vo
  static VO_DEF_EXPIRATION_RULES = 'urn:perun:vo:attribute-def:def:membershipExpirationRules';
  static VO_DEF_MAIL_FOOTER = 'urn:perun:vo:attribute-def:def:mailFooter';
  static VO_BLOCK_MANUAL_MEMBER_ADDING = 'urn:perun:vo:attribute-def:def:blockManualMemberAdding';

  // User
  static USER_DEF_ORGANIZATION = 'urn:perun:user:attribute-def:def:organization';
  static USER_DEF_PREFERRED_MAIL = 'urn:perun:user:attribute-def:def:preferredMail';

  // Group
  static GROUP_DEF_EXPIRATION_RULES =
    'urn:perun:group:attribute-def:def:groupMembershipExpirationRules';
  static GROUP_DEF_MAIL_FOOTER = 'urn:perun:group:attribute-def:def:mailFooter';
  static GROUP_SYNC_ENABLED = 'urn:perun:group:attribute-def:def:synchronizationEnabled';
  static GROUP_LAST_SYNC_STATE = 'urn:perun:group:attribute-def:def:lastSynchronizationState';
  static GROUP_LAST_SYNC_TIMESTAMP =
    'urn:perun:group:attribute-def:def:lastSynchronizationTimestamp';
  static GROUP_STRUCTURE_SYNC_ENABLED =
    'urn:perun:group:attribute-def:def:groupStructureSynchronizationEnabled';
  static GROUP_LAST_STRUCTURE_SYNC_STATE =
    'urn:perun:group:attribute-def:def:lastGroupStructureSynchronizationState';
  static GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP =
    'urn:perun:group:attribute-def:def:lastGroupStructureSynchronizationTimestamp';
  static GROUP_BLOCK_MANUAL_MEMBER_ADDING =
    'urn:perun:group:attribute-def:def:blockManualMemberAdding';

  // UserExtSource
  static UES_DEF_MAIL = 'urn:perun:ues:attribute-def:def:mail';
  static UES_DEF_ORGANIZATION = 'urn:perun:ues:attribute-def:def:o';
  static UES_SOURCE_IDP_NAME = 'urn:perun:ues:attribute-def:def:sourceIdPName';
}
