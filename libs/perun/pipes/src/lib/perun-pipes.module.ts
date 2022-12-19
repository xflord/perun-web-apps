import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceTagsToStringPipe } from './resource-tags-to-string.pipe';
import { IsVirtualAttributePipe } from './is-virtual-attribute.pipe';
import { UserFullNamePipe } from './user-full-name.pipe';
import { GetMailFromAttributesPipe } from './get-mail-from-attributes.pipe';
import { CustomTranslatePipe } from './custom-translate.pipe';
import { GroupSyncIconPipe } from './group-sync-icon.pipe';
import { GroupSyncToolTipPipe } from './group-sync-tool-tip.pipe';
import { GroupSyncIconColorPipe } from './group-sync-icon-color.pipe';
import { GetResourceRoutePipe } from './get-resource-route.pipe';
import { ServiceStateBlockedToStringPipe } from './service-state-blocked-to-string.pipe';
import { MemberStatusIconColorPipe } from './member-status-icon-color.pipe';
import { MemberStatusIconPipe } from './member-status-icon.pipe';
import { MemberStatusTooltipPipe } from './member-status-tooltip.pipe';
import { MemberEmailPipe } from './member-email.pipe';
import { MemberLoginsPipe } from './member-logins.pipe';
import { GroupExpirationPipe } from './group-expiration.pipe';
import { MemberOrganizationPipe } from './member-organization.pipe';
import { MemberStatusDisabledPipe } from './member-status-disabled.pipe';
import { MemberCheckboxLabelPipe } from './member-checkbox-label.pipe';
import { ParseDatePipe } from './parse-date.pipe';
import { TechnicalOwnersPipe } from './technical-owners.pipe';
import { FilterUniqueObjectsPipe } from './filter-unique-objects.pipe';
import { ParseGroupNamePipe } from './parse-group-name.pipe';
import { LocalisedTextPipe } from './localised-text.pipe';
import { LocalisedLinkPipe } from './localised-link.pipe';
import { UserEmailPipe } from './user-email.pipe';
import { UserLoginsPipe } from './user-logins.pipe';
import { UserVoPipe } from './vo-or-ext-source.pipe';
import { MemberStatusPipe } from './member-status.pipe';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { StyleInnerHtmlPipe } from './style-inner-html.pipe';
import { MultiWordDataCyPipe } from './multi-word-data-cy.pipe';
import { FooterLogoPathPipe } from './footer-logo-path.pipe';
import { DeleteDialogTypePipe } from './delete-dialog-type.pipe';
import { GroupMembersActionButtonDisabledPipe } from './group-members-action-button-disabled.pipe';
import { GroupMembersActionButtonDisabledTooltipPipe } from './group-members-action-button-disabled-tooltip.pipe';
import { DisabledCandidateTooltipPipe } from './disabled-candidate-tooltip.pipe';
import { DisplayedRolePipe } from './displayed-role.pipe';
import { DisableUniqueAttributePipe } from './disable-unique-attribute.pipe';
import { GroupStatusIconColorPipe } from './group-status-icon-color';
import { IsAllSelectedPipe } from './is-all-selected.pipe';
import { FindAttributePipe } from './find-attribute.pipe';
import { CanManageGroupPipe } from './can-manage-group.pipe';
import { DisableGroupSelectPipe } from './disable-group-select.pipe';
import { GroupCheckboxTooltipPipe } from './group-checkbox-tooltip.pipe';
import { ConsentStatusIconPipe } from './consent-status-icon.pipe';
import { CheckboxLabelPipe } from './checkbox-label.pipe';
import { MasterCheckboxLabelPipe } from './master-checkbox-label.pipe';
import { ManageableEntitiesPipe } from './manageable-entities.pipe';
import { UnassignedRolePipe } from './unassigned-role.pipe';
import { PublicationTabLabelPipe } from './publication-tab-label.pipe';
import { AuthorsSeparatedByCommaPipe } from './authors-separated-by-comma.pipe';
import { SelectApplicationLinkPipe } from './select-application-link.pipe';
import { IsAuthorizedPipe } from './is-authorized.pipe';
import { ExtractFacilityPipe } from './extract-facility.pipe';
import { ToEnrichedFacilityPipe } from './to-enriched-facility.pipe';
import { TransformMemberStatusPipe } from './transform-member-status.pipe';

@NgModule({
  declarations: [
    ResourceTagsToStringPipe,
    IsVirtualAttributePipe,
    UserFullNamePipe,
    GetMailFromAttributesPipe,
    CustomTranslatePipe,
    GroupSyncIconPipe,
    GroupSyncToolTipPipe,
    GroupSyncIconColorPipe,
    GetResourceRoutePipe,
    GroupSyncIconColorPipe,
    ServiceStateBlockedToStringPipe,
    MemberStatusIconColorPipe,
    MemberStatusIconPipe,
    MemberStatusTooltipPipe,
    MemberEmailPipe,
    MemberLoginsPipe,
    MemberOrganizationPipe,
    MemberStatusDisabledPipe,
    MemberCheckboxLabelPipe,
    GroupExpirationPipe,
    ParseDatePipe,
    TechnicalOwnersPipe,
    FilterUniqueObjectsPipe,
    ParseGroupNamePipe,
    LocalisedTextPipe,
    LocalisedLinkPipe,
    UserEmailPipe,
    UserLoginsPipe,
    UserVoPipe,
    MemberStatusPipe,
    SanitizeHtmlPipe,
    StyleInnerHtmlPipe,
    MultiWordDataCyPipe,
    FooterLogoPathPipe,
    DeleteDialogTypePipe,
    GroupStatusIconColorPipe,
    GroupMembersActionButtonDisabledPipe,
    GroupMembersActionButtonDisabledTooltipPipe,
    DisabledCandidateTooltipPipe,
    DisplayedRolePipe,
    DisableUniqueAttributePipe,
    IsAllSelectedPipe,
    FindAttributePipe,
    CanManageGroupPipe,
    DisableGroupSelectPipe,
    GroupCheckboxTooltipPipe,
    CheckboxLabelPipe,
    MasterCheckboxLabelPipe,
    ConsentStatusIconPipe,
    ManageableEntitiesPipe,
    UnassignedRolePipe,
    PublicationTabLabelPipe,
    AuthorsSeparatedByCommaPipe,
    SelectApplicationLinkPipe,
    IsAuthorizedPipe,
    ExtractFacilityPipe,
    ToEnrichedFacilityPipe,
    TransformMemberStatusPipe,
  ],
  exports: [
    ResourceTagsToStringPipe,
    IsVirtualAttributePipe,
    UserFullNamePipe,
    GetMailFromAttributesPipe,
    CustomTranslatePipe,
    GroupSyncIconPipe,
    GroupSyncToolTipPipe,
    GroupSyncIconColorPipe,
    GetResourceRoutePipe,
    GroupSyncIconColorPipe,
    ServiceStateBlockedToStringPipe,
    MemberStatusIconColorPipe,
    MemberStatusIconPipe,
    MemberStatusTooltipPipe,
    MemberEmailPipe,
    MemberLoginsPipe,
    GroupExpirationPipe,
    GroupStatusIconColorPipe,
    MemberOrganizationPipe,
    MemberStatusDisabledPipe,
    MemberCheckboxLabelPipe,
    ParseDatePipe,
    TechnicalOwnersPipe,
    FilterUniqueObjectsPipe,
    ParseGroupNamePipe,
    LocalisedTextPipe,
    LocalisedLinkPipe,
    UserEmailPipe,
    UserLoginsPipe,
    UserVoPipe,
    MemberStatusPipe,
    SanitizeHtmlPipe,
    StyleInnerHtmlPipe,
    MultiWordDataCyPipe,
    FooterLogoPathPipe,
    DeleteDialogTypePipe,
    GroupMembersActionButtonDisabledPipe,
    GroupMembersActionButtonDisabledTooltipPipe,
    DisabledCandidateTooltipPipe,
    DisplayedRolePipe,
    DisableUniqueAttributePipe,
    IsAllSelectedPipe,
    FindAttributePipe,
    CanManageGroupPipe,
    DisableGroupSelectPipe,
    GroupCheckboxTooltipPipe,
    CheckboxLabelPipe,
    MasterCheckboxLabelPipe,
    ConsentStatusIconPipe,
    ManageableEntitiesPipe,
    UnassignedRolePipe,
    PublicationTabLabelPipe,
    AuthorsSeparatedByCommaPipe,
    SelectApplicationLinkPipe,
    IsAuthorizedPipe,
    ExtractFacilityPipe,
    ToEnrichedFacilityPipe,
    TransformMemberStatusPipe,
  ],
  imports: [CommonModule],
})
export class PerunPipesModule {}
