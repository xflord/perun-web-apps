import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserOrganizationsComponent } from './pages/user-detail-page/user-organizations/user-organizations.component';
import { UserGroupsComponent } from './pages/user-detail-page/user-groups/user-groups.component';
import { UserSettingsComponent } from './pages/user-detail-page/user-settings/user-settings.component';
import { UserSettingsOverviewComponent } from './pages/user-detail-page/user-settings/user-settings-overview/user-settings-overview.component';
import { UserAttributesComponent } from './pages/user-detail-page/user-attributes/user-attributes.component';
import { PasswordResetComponent, SettingsSSHKeysComponent } from '@perun-web-apps/perun/components';
import { UserSettingsAppConfigurationComponent } from './pages/user-detail-page/user-settings/user-settings-app-configuration/user-settings-app-configuration.component';
import { UserOverviewComponent } from './pages/user-detail-page/user-overview/user-overview.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserRolesComponent } from './pages/user-detail-page/user-settings/user-roles/user-roles.component';
import { UserSettingsServiceIdentitiesComponent } from './pages/user-detail-page/user-settings/user-settings-service-identities/user-settings-service-identities.component';
import { ServiceIdentityDetailPageComponent } from './pages/user-detail-page/user-settings/user-settings-service-identities/service-identity-detail-page/service-identity-detail-page.component';
import { ServiceIdentityOverviewComponent } from './pages/user-detail-page/user-settings/user-settings-service-identities/service-identity-detail-page/service-identity-overview/service-identity-overview.component';
import { UserSettingsAssociatedUsersComponent } from './pages/user-detail-page/user-settings/user-settings-associated-users/user-settings-associated-users.component';
import { UserSettingsMailingListsComponent } from './pages/user-detail-page/user-settings/user-settings-mailing-lists/user-settings-mailing-lists.component';
import { UserSettingsDataQuotasComponent } from './pages/user-detail-page/user-settings/user-settings-data-quotas/user-settings-data-quotas.component';
import { ServiceIdentityAuthenticationOverviewComponent } from './pages/user-detail-page/user-settings/user-settings-service-identities/service-identity-authentication/service-identity-authentication-overview/service-identity-authentication-overview.component';
import { UserSettingsLoginsComponent } from './pages/user-detail-page/user-settings/user-settings-logins/user-settings-logins.component';
import { ServiceIdentityAuthenticationComponent } from './pages/user-detail-page/user-settings/user-settings-service-identities/service-identity-authentication/service-identity-authentication.component';
import { ServiceIdentityCertificatesComponent } from './pages/user-detail-page/user-settings/user-settings-service-identities/service-identity-authentication/service-identity-certificates/service-identity-certificates.component';
import { UserBansComponent } from './pages/user-detail-page/user-bans/user-bans.component';

const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent,
    children: [
      {
        path: '',
        component: UserOverviewComponent,
        data: { animation: 'UserOverviewPage' },
      },
      {
        path: 'attributes',
        component: UserAttributesComponent,
        data: { animation: 'UserAttributesPage' },
      },
      {
        path: 'organizations',
        component: UserOrganizationsComponent,
        data: { animation: 'UserOrganizationsPage', showPrincipal: true },
      },
      {
        path: 'groups',
        component: UserGroupsComponent,
        data: { animation: 'UserGroupsPage', showPrincipal: true },
      },
      {
        path: 'roles',
        component: UserRolesComponent,
        data: { animation: 'UserRolesPage' },
      },
      {
        path: 'service-identities',
        component: UserSettingsServiceIdentitiesComponent,
        data: { animation: 'UserServiceIdentities' },
      },
      {
        path: 'bans',
        component: UserBansComponent,
        data: { animation: 'UserBansPage' },
      },
      {
        path: 'settings',
        component: UserSettingsComponent,
        children: [
          {
            path: '',
            component: UserSettingsOverviewComponent,
            data: { animation: 'UserSettingsOverviewPage' },
          },
          {
            path: 'passwordReset',
            component: PasswordResetComponent,
            data: { animation: 'PasswordResetPage' },
          },
          {
            path: 'guiConfig',
            component: UserSettingsAppConfigurationComponent,
            data: { animation: 'UserAppConfigurationPage' },
          },
        ],
      },
    ],
  },
  {
    path: 'service-identities/:userId',
    component: ServiceIdentityDetailPageComponent,
    children: [
      {
        path: '',
        component: ServiceIdentityOverviewComponent,
      },
      {
        path: 'associated-users',
        component: UserSettingsAssociatedUsersComponent,
      },
      {
        path: 'authentication',
        component: ServiceIdentityAuthenticationComponent,
        children: [
          {
            path: '',
            component: ServiceIdentityAuthenticationOverviewComponent,
          },
          {
            path: 'logins',
            component: UserSettingsLoginsComponent,
          },
          {
            path: 'certificates',
            component: ServiceIdentityCertificatesComponent,
          },
          {
            path: 'ssh-keys',
            component: SettingsSSHKeysComponent,
          },
        ],
      },
      {
        path: 'mailing-lists',
        component: UserSettingsMailingListsComponent,
      },
      {
        path: 'data-quotas',
        component: UserSettingsDataQuotasComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
