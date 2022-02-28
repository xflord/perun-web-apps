import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from '@perun-web-apps/perun/models';
import { Resource, ResourcesManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-resource-overview',
  templateUrl: './resource-overview.component.html',
  styleUrls: ['./resource-overview.component.scss'],
})
export class ResourceOverviewComponent implements OnInit {
  // class used for animation
  @HostBinding('class.router-component') true;
  navItems: MenuItem[] = [];
  resource: Resource;
  loading = false;

  constructor(
    private resourcesManager: ResourcesManagerService,
    private route: ActivatedRoute,
    public guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resource = this.entityStorageService.getEntity();
    if (this.route.parent.parent.snapshot.url[0].path === 'facilities') {
      this.initItems(false);
    } else {
      this.initItems(true);
    }
    this.loading = false;
  }

  private initItems(inVo: boolean): void {
    const urlStart = inVo
      ? `/organizations/${this.resource.voId}`
      : `/facilities/${this.resource.facilityId}`;
    this.navItems = [];

    if (this.guiAuthResolver.isAuthorized('getAssignedGroups_Resource_policy', [this.resource])) {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `${urlStart}/resources/${this.resource.id}/groups`,
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_GROUPS',
        style: 'resource-btn',
      });
    }
    if (this.guiAuthResolver.isAuthorized('getAssignedServices_Resource_policy', [this.resource])) {
      this.navItems.push({
        cssIcon: 'perun-service',
        url: `/${urlStart}/resources/${this.resource.id}/services`,
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_SERVICES',
        style: 'resource-btn',
      });
    }
    if (this.guiAuthResolver.isAuthorized('getAssignedMembers_Resource_policy', [this.resource])) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `${urlStart}/resources/${this.resource.id}/members`,
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_MEMBERS',
        style: 'resource-btn',
      });
    }
    if (
      this.guiAuthResolver.isAuthorized('getAllResourcesTagsForResource_Resource_policy', [
        this.resource,
      ])
    ) {
      this.navItems.push({
        cssIcon: 'perun-resource-tags',
        url: `${urlStart}/resources/${this.resource.id}/tags`,
        label: 'MENU_ITEMS.RESOURCE.RESOURCE_TAGS',
        style: 'resource-btn',
      });
    }

    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `${urlStart}/resources/${this.resource.id}/attributes`,
      label: 'MENU_ITEMS.RESOURCE.ATTRIBUTES',
      style: 'resource-btn',
    });

    const managersAuth = this.guiAuthResolver.isManagerPagePrivileged(this.resource);
    if (managersAuth) {
      this.navItems.push({
        cssIcon: 'perun-settings2',
        url: `${urlStart}/resources/${this.resource.id}/settings`,
        label: 'MENU_ITEMS.RESOURCE.SETTINGS',
        style: 'resource-btn',
      });
    }
  }
}
