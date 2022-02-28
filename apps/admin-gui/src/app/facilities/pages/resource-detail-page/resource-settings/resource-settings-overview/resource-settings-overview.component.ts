import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from '@perun-web-apps/perun/models';
import { Resource, ResourcesManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-resource-settings-overview',
  templateUrl: './resource-settings-overview.component.html',
  styleUrls: ['./resource-settings-overview.component.scss'],
})
export class ResourceSettingsOverviewComponent implements OnInit {
  @HostBinding('class.router-component') true;
  items: MenuItem[] = [];
  resource: Resource;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private resourceManager: ResourcesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resource = this.entityStorageService.getEntity();
    if (this.route.parent.parent.parent.snapshot.url[0].path === 'facilities') {
      this.initItems(false);
    } else {
      this.initItems(true);
    }
    this.loading = false;
  }

  private initItems(inVo: boolean): void {
    this.items = [];

    const managersAuth = this.authResolver.isManagerPagePrivileged(this.resource);
    if (managersAuth) {
      this.items.push({
        cssIcon: 'perun-manager',
        url: `${
          inVo ? `/organizations/${this.resource.voId}` : `/facilities/${this.resource.facilityId}`
        }/resources/${this.resource.id}/settings/managers`,
        label: 'MENU_ITEMS.RESOURCE.MANAGERS',
        style: 'resource-btn',
      });
    }
  }
}
