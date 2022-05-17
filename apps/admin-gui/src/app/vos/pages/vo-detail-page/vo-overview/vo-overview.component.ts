import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { SideMenuService } from '../../../../core/services/common/side-menu.service';
import { Router } from '@angular/router';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-vo-overview',
  templateUrl: './vo-overview.component.html',
  styleUrls: ['./vo-overview.component.scss'],
})
export class VoOverviewComponent implements OnInit {
  // @HostBinding('class.router-component') true;

  vo: Vo;
  items: MenuItem[] = [];
  navItems: MenuItem[] = [];
  loading = false;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    protected router: Router,
    protected authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.initNavItems();
    this.loading = false;
  }

  private initNavItems(): void {
    // Members
    if (
      this.authResolver.isAuthorized('getMembersPage_Vo_MembersPageQuery_List<String>_policy', [
        this.vo,
      ])
    ) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.vo.id}/members`,
        label: 'MENU_ITEMS.VO.MEMBERS',
        style: 'vo-btn',
      });
    }

    // Groups
    if (
      this.authResolver.isAuthorized(
        'getAllRichGroupsWithAttributesByNames_Vo_List<String>_policy',
        [this.vo]
      )
    ) {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.vo.id}/groups`,
        label: 'MENU_ITEMS.VO.GROUPS',
        style: 'vo-btn',
      });
    }

    // Resource management
    if (this.authResolver.isAuthorized('getRichResources_Vo_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-manage-facility',
        url: `/organizations/${this.vo.id}/resources`,
        label: 'MENU_ITEMS.VO.RESOURCES',
        style: 'vo-btn',
      });
    }

    // Applications
    if (
      this.authResolver.isAuthorized('getApplicationsForVo_Vo_List<String>_Boolean_policy', [
        this.vo,
      ])
    ) {
      this.navItems.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.vo.id}/applications`,
        label: 'MENU_ITEMS.VO.APPLICATIONS',
        style: 'vo-btn',
      });
    }

    // Sponsored members
    if (
      this.authResolver.isAuthorized('getSponsoredMembersAndTheirSponsors_Vo_policy', [this.vo])
    ) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.vo.id}/sponsoredMembers`,
        label: 'MENU_ITEMS.VO.SPONSORED_MEMBERS',
        style: 'vo-btn',
      });
    }

    // Service members
    if (
      this.authResolver.isAuthorized(
        `createSpecificMember_Vo_Candidate_List<User>_SpecificUserType_List<Group>_policy`,
        [this.vo]
      )
    ) {
      this.navItems.push({
        cssIcon: 'perun-service-identity',
        url: `/organizations/${this.vo.id}/serviceAccounts`,
        label: 'MENU_ITEMS.VO.SERVICE_MEMBERS',
        style: 'vo-btn',
      });
    }

    // Attributes
    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `/organizations/${this.vo.id}/attributes`,
      label: 'MENU_ITEMS.VO.ATTRIBUTES',
      style: 'vo-btn',
    });

    // Statistics
    if (
      this.authResolver.isAuthorized('getMembersCount_Vo_Status_policy', [this.vo]) &&
      this.authResolver.isAuthorized('getMembersCount_Vo_policy', [this.vo])
    ) {
      this.navItems.push({
        cssIcon: 'perun-statistics',
        url: `/organizations/${this.vo.id}/statistics`,
        label: 'MENU_ITEMS.VO.STATISTICS',
        style: 'vo-btn',
      });
    }

    // Settings
    if (
      this.authResolver.isManagerPagePrivileged(this.vo) ||
      this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [this.vo]) ||
      this.authResolver.isThisVoAdminOrObserver(this.vo.id)
    ) {
      this.navItems.push({
        cssIcon: 'perun-settings2',
        url: `/organizations/${this.vo.id}/settings`,
        label: 'MENU_ITEMS.VO.SETTINGS',
        style: 'vo-btn',
      });
    }
  }
}
