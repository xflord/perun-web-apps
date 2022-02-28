import { Component, HostBinding, OnInit } from '@angular/core';
import { SideMenuService } from '../../../../../core/services/common/side-menu.service';
import { MenuItem } from '@perun-web-apps/perun/models';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-resources-overview',
  templateUrl: './vo-resources-overview.component.html',
  styleUrls: ['./vo-resources-overview.component.scss'],
})
export class VoResourcesOverviewComponent implements OnInit {
  @HostBinding('class.router-component') true;
  items: MenuItem[] = [];
  vo: Vo;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.vo = this.entityStorageService.getEntity();
    this.initItems();
  }

  private initItems(): void {
    this.items = [
      {
        cssIcon: 'perun-resource',
        url: `/organizations/${this.vo.id}/resources/preview`,
        label: 'MENU_ITEMS.VO.RESOURCE_PREVIEW',
        style: 'vo-btn',
      },
    ];

    if (this.authResolver.isAuthorized('getAllResourcesTagsForVo_Vo_policy', [this.vo])) {
      this.items.push({
        cssIcon: 'perun-resource-tags',
        url: `/organizations/${this.vo.id}/resources/tags`,
        label: 'MENU_ITEMS.VO.RESOURCE_TAGS',
        style: 'vo-btn',
      });
    }

    if (this.authResolver.isAuthorized('getResourcesState_Vo_policy', [this.vo])) {
      this.items.push({
        cssIcon: 'perun-resources-state',
        url: `/organizations/${this.vo.id}/resources/states`,
        label: 'MENU_ITEMS.VO.RESOURCE_STATES',
        style: 'vo-btn',
      });
    }
  }
}
