import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from '@perun-web-apps/perun/models';
import { Resource, ResourcesManagerService } from '@perun-web-apps/perun/openapi';
import {
  EntityStorageService,
  GuiAuthResolver,
  RoutePolicyService,
} from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-resource-overview',
  templateUrl: './resource-overview.component.html',
  styleUrls: ['./resource-overview.component.scss'],
})
export class ResourceOverviewComponent implements OnInit {
  // class used for animation
  @HostBinding('class.router-component') true;
  items: MenuItem[] = [];
  settingsItems: MenuItem[] = [];
  resource: Resource;
  loading = false;

  constructor(
    private resourcesManager: ResourcesManagerService,
    private route: ActivatedRoute,
    public guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private routePolicyService: RoutePolicyService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resource = this.entityStorageService.getEntity();
    const inVo = this.route.parent.parent.snapshot.url[0].path === 'facilities';
    this.setItems(inVo);
    this.setSettingsItems(inVo);
    this.loading = false;
  }

  private setItems(inVo: boolean): void {
    const urlStart = inVo
      ? `/organizations/${this.resource.voId}`
      : `/facilities/${this.resource.facilityId}`;
    this.items = [];

    if (this.routePolicyService.canNavigate('resources-groups', this.resource)) {
      this.items.push({
        cssIcon: 'perun-group',
        url: `${urlStart}/resources/${this.resource.id}/groups`,
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_GROUPS',
        style: 'resource-btn',
      });
    }
    if (this.routePolicyService.canNavigate('resources-services', this.resource)) {
      this.items.push({
        cssIcon: 'perun-service',
        url: `${urlStart}/resources/${this.resource.id}/services`,
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_SERVICES',
        style: 'resource-btn',
      });
    }
    if (this.routePolicyService.canNavigate('resources-members', this.resource)) {
      this.items.push({
        cssIcon: 'perun-user',
        url: `${urlStart}/resources/${this.resource.id}/members`,
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_MEMBERS',
        style: 'resource-btn',
      });
    }
    if (this.routePolicyService.canNavigate('resources-tags', this.resource)) {
      this.items.push({
        cssIcon: 'perun-resource-tags',
        url: `${urlStart}/resources/${this.resource.id}/tags`,
        label: 'MENU_ITEMS.RESOURCE.RESOURCE_TAGS',
        style: 'resource-btn',
      });
    }

    if (this.routePolicyService.canNavigate('resources-attributes', this.resource)) {
      this.items.push({
        cssIcon: 'perun-attributes',
        url: `${urlStart}/resources/${this.resource.id}/attributes`,
        label: 'MENU_ITEMS.RESOURCE.ATTRIBUTES',
        style: 'resource-btn',
      });
    }
  }

  private setSettingsItems(inVo: boolean): void {
    this.settingsItems = [];

    if (this.routePolicyService.canNavigate('resources-settings-managers', this.resource)) {
      this.settingsItems.push({
        cssIcon: 'perun-manager',
        url: `${
          inVo ? `/organizations/${this.resource.voId}` : `/facilities/${this.resource.facilityId}`
        }/resources/${this.resource.id}/settings/managers`,
        label: 'MENU_ITEMS.RESOURCE.MANAGERS',
        style: 'resource-btn',
      });
    }

    if (this.routePolicyService.canNavigate('resources-settings-bans', this.resource)) {
      this.settingsItems.push({
        cssIcon: 'perun-ban',
        url: `${
          inVo ? `/organizations/${this.resource.voId}` : `/facilities/${this.resource.facilityId}`
        }/resources/${this.resource.id}/settings/bans`,
        label: 'MENU_ITEMS.RESOURCE.BANS',
        style: 'resource-btn',
      });
    }
  }
}
