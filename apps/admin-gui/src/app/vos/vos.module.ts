import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoSelectPageComponent } from './pages/vo-select-page/vo-select-page.component';
import { VosRoutingModule } from './vos-routing.module';
import { SharedModule } from '../shared/shared.module';
import { VoDetailPageComponent } from './pages/vo-detail-page/vo-detail-page.component';
import { GroupDetailPageComponent } from './pages/group-detail-page/group-detail-page.component';
import { VoOverviewComponent } from './pages/vo-detail-page/vo-overview/vo-overview.component';
import { VoGroupsComponent } from './pages/vo-detail-page/vo-groups/vo-groups.component';
import { VoMembersComponent } from './pages/vo-detail-page/vo-members/vo-members.component';
import { MemberDetailPageComponent } from './pages/member-detail-page/member-detail-page.component';
import { MemberOverviewComponent } from './pages/member-detail-page/member-overview/member-overview.component';
import { MemberGroupsComponent } from './pages/member-detail-page/member-groups/member-groups.component';
import { GroupOverviewComponent } from './pages/group-detail-page/group-overview/group-overview.component';
import { GroupSubgroupsComponent } from './pages/group-detail-page/group-subgroups/group-subgroups.component';
import { VoResourcesComponent } from './pages/vo-detail-page/vo-resources/vo-resources.component';
import { VoApplicationsComponent } from './pages/vo-detail-page/vo-applications/vo-applications.component';
import { VoSettingsComponent } from './pages/vo-detail-page/vo-settings/vo-settings.component';
import { VoAttributesComponent } from './pages/vo-detail-page/vo-attributes/vo-attributes.component';
import { VoSettingsOverviewComponent } from './pages/vo-detail-page/vo-settings/vo-settings-overview/vo-settings-overview.component';
import { VoSettingsExpirationComponent } from './pages/vo-detail-page/vo-settings/vo-settings-expiration/vo-settings-expiration.component';
import { ApplicationsListComponent } from './components/applications-list/applications-list.component';
import { ApplicationsDynamicListComponent } from './components/applications-dynamic-list/applications-dynamic-list.component';
import { ApplicationTypeIconComponent } from './components/application-type-icon/application-type-icon.component';
import { GroupApplicationsComponent } from './pages/group-detail-page/group-applications/group-applications.component';
import { VoSettingsManagersComponent } from './pages/vo-detail-page/vo-settings/vo-settings-managers/vo-settings-managers.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { GroupMembersComponent } from './pages/group-detail-page/group-members/group-members.component';
import { GroupResourcesComponent } from './pages/group-detail-page/group-resources/group-resources.component';
// eslint-disable-next-line max-len
import { GroupSettingsComponent } from './pages/group-detail-page/group-settings/group-settings.component';
import { GroupAttributesComponent } from './pages/group-detail-page/group-attributes/group-attributes.component';
import { GroupSettingsOverviewComponent } from './pages/group-detail-page/group-settings/group-settings-overview/group-settings-overview.component';
import { VoSettingsApplicationFormComponent } from './pages/vo-detail-page/vo-settings/vo-settings-application-form/vo-settings-application-form.component';
import { ApplicationFormListComponent } from './components/application-form-list/application-form-list.component';
// eslint-disable-next-line max-len
import { ApplicationFormPreviewComponent } from './components/application-form-preview/application-form-preview.component';
import { MemberAttributesComponent } from './pages/member-detail-page/member-attributes/member-attributes.component';
import { VoResourcesPreviewComponent } from './pages/vo-detail-page/vo-resources/vo-resources-preview/vo-resources-preview.component';
import { VoResourcesTagsComponent } from './pages/vo-detail-page/vo-resources/vo-resources-tags/vo-resources-tags.component';
import { VoResourcesStatesComponent } from './pages/vo-detail-page/vo-resources/vo-resources-states/vo-resources-states.component';
import { VoResourcesOverviewComponent } from './pages/vo-detail-page/vo-resources/vo-resources-overview/vo-resources-overview.component';
import { StateTabComponent } from './pages/vo-detail-page/vo-resources/vo-resources-states/state-tab/state-tab.component';
import { GroupSettingsExpirationComponent } from './pages/group-detail-page/group-settings/group-settings-expiration/group-settings-expiration.component';
import { ExpirationSettingsComponent } from './components/expiration-settings/expiration-settings.component';
import { VoSettingsNotificationsComponent } from './pages/vo-detail-page/vo-settings/vo-settings-notifications/vo-settings-notifications.component';
import { GroupSettingsApplicationFormComponent } from './pages/group-detail-page/group-settings/group-settings-application-form/group-settings-application-form.component';
import { GroupSettingsManagersComponent } from './pages/group-detail-page/group-settings/group-settings-managers/group-settings-managers.component';
import { GroupSettingsNotificationsComponent } from './pages/group-detail-page/group-settings/group-settings-notifications/group-settings-notifications.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { VoSettingsExtsourcesComponent } from './pages/vo-detail-page/vo-settings/vo-settings-extsources/vo-settings-extsources.component';
import { GroupSettingsRelationsComponent } from './pages/group-detail-page/group-settings/group-settings-relations/group-settings-relations.component';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { ApplicationListDetailsComponent } from './components/application-list-details/application-list-details.component';
import { PerunPipesModule } from '@perun-web-apps/perun/pipes';
import { MemberApplicationsComponent } from './pages/member-detail-page/member-applications/member-applications.component';
import { MemberResourcesComponent } from './pages/member-detail-page/member-resources/member-resources.component';
import { VoSettingsSponsoredMembersComponent } from './pages/vo-detail-page/vo-settings/vo-settings-sponsored-members/vo-settings-sponsored-members.component';
import { GroupSettingsExtsourcesComponent } from './pages/group-detail-page/group-settings/group-settings-extsources/group-settings-extsources.component';
import { VoStatisticsComponent } from './pages/vo-detail-page/vo-statistics/vo-statistics.component';
import { GroupStatisticsComponent } from './pages/group-detail-page/group-statistics/group-statistics.component';
import { ApplicationFormManageGroupsComponent } from './components/application-form-manage-groups/application-form-manage-groups.component';
import { PerunUtilsModule } from '@perun-web-apps/perun/utils';
import { VoSettingsServiceMembersComponent } from './pages/vo-detail-page/vo-settings/vo-settings-service-members/vo-settings-service-members.component';
import { VoSettingsMemberOrganizationsComponent } from './pages/vo-detail-page/vo-settings/vo-settings-member-organizations/vo-settings-member-organizations.component';
import { AddMemberOrganizationDialogComponent } from './pages/vo-detail-page/vo-settings/vo-settings-member-organizations/add-member-organization-dialog/add-member-organization-dialog.component';
import { RelatedVosComponent } from './components/related-vos/related-vos.component';
import { VoSettingsHierarchicalInclusionComponent } from './pages/vo-detail-page/vo-settings/vo-settings-hierarchical-inclusion/vo-settings-hierarchical-inclusion.component';
import { VoAddMemberDialogComponent } from './components/vo-add-member-dialog/vo-add-member-dialog.component';
import { GroupAddMemberDialogComponent } from './components/group-add-member-dialog/group-add-member-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    VosRoutingModule,
    SharedModule,
    UiAlertsModule,
    PerunSharedComponentsModule,
    PerunPipesModule,
    PerunUtilsModule,
  ],
  exports: [],
  declarations: [
    VoSelectPageComponent,
    VoDetailPageComponent,
    GroupDetailPageComponent,
    VoOverviewComponent,
    VoGroupsComponent,
    VoMembersComponent,
    MemberDetailPageComponent,
    MemberOverviewComponent,
    MemberGroupsComponent,
    GroupOverviewComponent,
    GroupSubgroupsComponent,
    VoResourcesComponent,
    VoApplicationsComponent,
    VoSettingsComponent,
    VoAttributesComponent,
    VoSettingsOverviewComponent,
    VoSettingsExpirationComponent,
    ApplicationsListComponent,
    ApplicationsDynamicListComponent,
    ApplicationTypeIconComponent,
    GroupApplicationsComponent,
    VoSettingsManagersComponent,
    ApplicationDetailComponent,
    GroupMembersComponent,
    GroupMembersComponent,
    GroupApplicationsComponent,
    GroupResourcesComponent,
    GroupSettingsComponent,
    GroupAttributesComponent,
    GroupSettingsOverviewComponent,
    VoSettingsApplicationFormComponent,
    ApplicationFormListComponent,
    ApplicationFormPreviewComponent,
    GroupSettingsOverviewComponent,
    MemberAttributesComponent,
    VoResourcesPreviewComponent,
    VoResourcesTagsComponent,
    VoResourcesStatesComponent,
    VoResourcesOverviewComponent,
    StateTabComponent,
    GroupSettingsExpirationComponent,
    ExpirationSettingsComponent,
    VoSettingsNotificationsComponent,
    GroupSettingsApplicationFormComponent,
    ExpirationSettingsComponent,
    GroupSettingsManagersComponent,
    GroupSettingsNotificationsComponent,
    NotificationListComponent,
    VoSettingsExtsourcesComponent,
    GroupSettingsRelationsComponent,
    ApplicationListDetailsComponent,
    MemberApplicationsComponent,
    MemberResourcesComponent,
    MemberApplicationsComponent,
    VoSettingsSponsoredMembersComponent,
    GroupSettingsExtsourcesComponent,
    VoStatisticsComponent,
    GroupStatisticsComponent,
    ApplicationFormManageGroupsComponent,
    VoSettingsServiceMembersComponent,
    VoSettingsMemberOrganizationsComponent,
    AddMemberOrganizationDialogComponent,
    RelatedVosComponent,
    VoSettingsHierarchicalInclusionComponent,
    VoAddMemberDialogComponent,
    GroupAddMemberDialogComponent,
  ],
})
export class VosModule {}
