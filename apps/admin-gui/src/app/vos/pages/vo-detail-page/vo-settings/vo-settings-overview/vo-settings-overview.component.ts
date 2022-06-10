import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '@perun-web-apps/perun/models';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, RoutePolicyService } from '@perun-web-apps/perun/services';

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
    private voService: VosManagerService,
    protected router: Router,
    private entityStorageService: EntityStorageService,
    private routePolicyService: RoutePolicyService
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

    // Membership
    if (this.routePolicyService.canNavigate('organizations-settings-expiration', this.vo)) {
      this.items.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.vo.id}/settings/expiration`,
        label: 'MENU_ITEMS.VO.EXPIRATION',
        style: 'vo-btn',
      });
    }
    // Managers
    if (this.routePolicyService.canNavigate('organizations-settings-managers', this.vo)) {
      this.items.push({
        cssIcon: 'perun-manager',
        url: `/organizations/${this.vo.id}/settings/managers`,
        label: 'MENU_ITEMS.VO.MANAGERS',
        style: 'vo-btn',
      });
    }
    // Application forms
    if (this.routePolicyService.canNavigate('organizations-settings-applicationForm', this.vo)) {
      this.items.push({
        cssIcon: 'perun-application-form',
        url: `/organizations/${this.vo.id}/settings/applicationForm`,
        label: 'MENU_ITEMS.VO.APPLICATION_FORM',
        style: 'vo-btn',
      });
    }
    // Notifications
    if (this.routePolicyService.canNavigate('organizations-settings-notifications', this.vo)) {
      this.items.push({
        cssIcon: 'perun-notification',
        url: `/organizations/${this.vo.id}/settings/notifications`,
        label: 'MENU_ITEMS.VO.NOTIFICATIONS',
        style: 'vo-btn',
      });
    }
    // Ext sources
    if (this.routePolicyService.canNavigate('organizations-settings-extsources', this.vo)) {
      this.items.push({
        cssIcon: 'perun-external-sources',
        url: `/organizations/${this.vo.id}/settings/extsources`,
        label: 'MENU_ITEMS.VO.EXTSOURCES',
        style: 'vo-btn',
      });
    }
    // Member organizations
    if (
      this.routePolicyService.canNavigate('organizations-settings-memberOrganizations', this.vo)
    ) {
      this.items.push({
        cssIcon: 'perun-hierarchical-vo',
        url: `/organizations/${this.vo.id}/settings/memberOrganizations`,
        label: 'MENU_ITEMS.VO.MEMBER_ORGANIZATIONS',
        style: 'vo-btn',
      });
    }
    // Hierarchical inclusion
    if (
      this.routePolicyService.canNavigate(
        'organizations-settings-hierarchicalInclusion',
        this.vo
      ) &&
      this.isMemberOfSomeOrganization
    ) {
      this.items.push({
        cssIcon: 'perun-hierarchical-inclusion',
        url: `/organizations/${this.vo.id}/settings/hierarchicalInclusion`,
        label: 'MENU_ITEMS.VO.HIERARCHICAL_INCLUSION',
        style: 'vo-btn',
      });
    }
  }
}
