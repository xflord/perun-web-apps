import { Component, HostBinding, OnInit } from '@angular/core';
import { SideMenuService } from '../../../../../core/services/common/side-menu.service';
import { Router } from '@angular/router';
import { MenuItem } from '@perun-web-apps/perun/models';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-settings-overview',
  templateUrl: './vo-settings-overview.component.html',
  styleUrls: ['./vo-settings-overview.component.scss'],
})
export class VoSettingsOverviewComponent implements OnInit {
  @HostBinding('class.router-component') true;

  items: MenuItem[] = [];
  loading = false;
  isMemberOfSomeOrganization = false;
  private vo: Vo;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private authResolver: GuiAuthResolver,
    protected router: Router,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.voService.getEnrichedVoById(this.vo.id).subscribe((enrichedVo) => {
      this.isMemberOfSomeOrganization = enrichedVo.parentVos.length !== 0;
      this.initItems();
      this.loading = false;
    });
  }

  private initItems(): void {
    this.items = [];
    const adminOrObserver = this.authResolver.isThisVoAdminOrObserver(this.vo.id);

    // Membership
    if (adminOrObserver) {
      this.items.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.vo.id}/settings/expiration`,
        label: 'MENU_ITEMS.VO.EXPIRATION',
        style: 'vo-btn',
      });
    }
    // Managers
    if (this.authResolver.isManagerPagePrivileged(this.vo)) {
      this.items.push({
        cssIcon: 'perun-manager',
        url: `/organizations/${this.vo.id}/settings/managers`,
        label: 'MENU_ITEMS.VO.MANAGERS',
        style: 'vo-btn',
      });
    }
    // Application forms
    if (adminOrObserver) {
      this.items.push({
        cssIcon: 'perun-application-form',
        url: `/organizations/${this.vo.id}/settings/applicationForm`,
        label: 'MENU_ITEMS.VO.APPLICATION_FORM',
        style: 'vo-btn',
      });
    }
    // Notifications
    if (adminOrObserver) {
      this.items.push({
        cssIcon: 'perun-notification',
        url: `/organizations/${this.vo.id}/settings/notifications`,
        label: 'MENU_ITEMS.VO.NOTIFICATIONS',
        style: 'vo-btn',
      });
    }
    // Ext sources
    if (this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [this.vo])) {
      this.items.push({
        cssIcon: 'perun-external-sources',
        url: `/organizations/${this.vo.id}/settings/extsources`,
        label: 'MENU_ITEMS.VO.EXTSOURCES',
        style: 'vo-btn',
      });
    }
    // Member organizations
    if (this.authResolver.isPerunAdmin()) {
      this.items.push({
        cssIcon: 'perun-hierarchical-vo',
        url: `/organizations/${this.vo.id}/settings/memberOrganizations`,
        label: 'MENU_ITEMS.VO.MEMBER_ORGANIZATIONS',
        style: 'vo-btn',
      });
    }
    // Hierarchical inclusion
    if (this.authResolver.isPerunAdmin() && this.isMemberOfSomeOrganization) {
      this.items.push({
        cssIcon: 'perun-hierarchical-inclusion',
        url: `/organizations/${this.vo.id}/settings/hierarchicalInclusion`,
        label: 'MENU_ITEMS.VO.HIERARCHICAL_INCLUSION',
        style: 'vo-btn',
      });
    }
  }
}
