import { Component, OnInit } from '@angular/core';
import { getRecentlyVisitedItems, RecentItem } from '@perun-web-apps/perun/utils';
import {
  FacilitiesManagerService,
  Facility,
  Group,
  GroupsManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

interface RecentDisplayedItem {
  url: string;
  label: string;
  tooltip?: string;
  style: string;
  cssIcon: string;
  type: string;
}

@Component({
  selector: 'app-perun-web-apps-dashboard-recently-viewed-button-field',
  templateUrl: './dashboard-recently-viewed-button-field.component.html',
  styleUrls: ['./dashboard-recently-viewed-button-field.component.scss'],
})
export class DashboardRecentlyViewedButtonFieldComponent implements OnInit {
  items: RecentDisplayedItem[] = [];
  vosIds: number[] = [];
  groupsIds: number[] = [];
  facilitiesIds: number[] = [];
  existingRecentIds: number[] = [];
  recentItems: RecentItem[];
  loading: boolean;
  vos: Vo[] = [];
  groups: Group[] = [];
  facilities: Facility[] = [];

  constructor(
    private vosManager: VosManagerService,
    private groupsManager: GroupsManagerService,
    private authResolver: GuiAuthResolver,
    private facilitiesManager: FacilitiesManagerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.recentItems = getRecentlyVisitedItems('recent');
    for (const item of this.recentItems) {
      switch (item.type) {
        case 'Vo': {
          this.vosIds.push(item.id);
          break;
        }
        case 'Group': {
          this.groupsIds.push(item.id);
          break;
        }
        case 'Facility': {
          this.facilitiesIds.push(item.id);
          break;
        }
      }
    }

    // if no vos/groups/facilities are in recently viewed, post to the backend "-1" to get an empty array
    if (this.vosIds.length === 0) {
      this.vosIds.push(-1);
    }
    if (this.groupsIds.length === 0) {
      this.groupsIds.push(-1);
    }
    if (this.facilitiesIds.length === 0) {
      this.facilitiesIds.push(-1);
    }

    this.getVos();
  }

  getVos(): void {
    if (this.authResolver.isAuthorized('getVosByIds_List<Integer>_policy', [])) {
      this.vosManager.getVosByIds(this.vosIds).subscribe((vos) => {
        this.vos = vos;
        this.getGroups();
      });
    } else {
      this.getGroups();
    }
  }

  getGroups(): void {
    if (this.authResolver.isAuthorized('getGroupsByIds_List<Integer>_policy', [])) {
      this.groupsManager.getGroupsByIds(this.groupsIds).subscribe((groups) => {
        this.groups = groups;
        this.getFacilities();
      });
    } else {
      this.getFacilities();
    }
  }

  getFacilities(): void {
    if (this.authResolver.isAuthorized('getFacilitiesByIds_List<Integer>_policy', [])) {
      this.facilitiesManager.getFacilitiesByIds(this.facilitiesIds).subscribe((facilities) => {
        this.facilities = facilities;
        this.addRecentlyViewedToDashboard();
      });
    } else {
      this.addRecentlyViewedToDashboard();
    }
  }

  private addRecentlyViewedToDashboard(): void {
    for (const item of this.recentItems) {
      switch (item.type) {
        case 'Vo': {
          const filteredVo = this.vos.filter((vo) => vo.id === item.id)[0];
          if (filteredVo) {
            this.items.push({
              cssIcon: 'perun-vo',
              url: `/organizations/${filteredVo.id}`,
              label: filteredVo.name,
              tooltip: filteredVo.name,
              style: 'vo-btn',
              type: 'Organization',
            });
          }
          break;
        }
        case 'Group': {
          const filteredGroup = this.groups.filter((group) => group.id === item.id)[0];
          if (filteredGroup) {
            this.items.push({
              cssIcon: 'perun-group',
              url: `/organizations/${filteredGroup.voId}/groups/${filteredGroup.id}`,
              label: filteredGroup.shortName,
              tooltip: `${item.voName} : ${filteredGroup.name.replace(/:/g, ' : ')}`,
              style: 'group-btn',
              type: 'Group',
            });
          }
          break;
        }
        case 'Facility': {
          const filteredFacility = this.facilities.filter((facility) => facility.id === item.id)[0];
          if (filteredFacility) {
            this.items.push({
              cssIcon: 'perun-facility-white',
              url: `/facilities/${filteredFacility.id}`,
              label: filteredFacility.name,
              tooltip: filteredFacility.name,
              style: 'facility-btn',
              type: 'Facility',
            });
          }
          break;
        }
      }
    }
    this.loading = false;
  }
}
