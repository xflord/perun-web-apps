import { Component, OnInit } from '@angular/core';
import { getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';
import {
  FacilitiesManagerService,
  GroupsManagerService,
  VosManagerService
} from '@perun-web-apps/perun/openapi';

export interface RecentItem {
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
  styleUrls: ['./dashboard-recently-viewed-button-field.component.scss']
})
export class DashboardRecentlyViewedButtonFieldComponent implements OnInit {

  constructor(private vosManager: VosManagerService,
              private groupsManager: GroupsManagerService,
              private facilitiesManager: FacilitiesManagerService) { }

  items: RecentItem[] = [];

  vosIds: number[] = [];
  groupsIds: number[] = [];
  facilitiesIds: number[] = [];
  existingRecentIds: number[] = [];

  ngOnInit() {
    let recent = getRecentlyVisitedIds('recent');

    for (const item of recent) {
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

    this.vosManager.getVosByIds(this.vosIds).subscribe(vos => {
      this.existingRecentIds.push(...vos.map(vo => vo.id));
      this.groupsManager.getGroupsByIds(this.groupsIds).subscribe(groups => {
        this.existingRecentIds.push(...groups.map(group => group.id));
        this.facilitiesManager.getFacilitiesByIds(this.facilitiesIds).subscribe(facilities => {
          this.existingRecentIds.push(...facilities.map(facility => facility.id));
          recent = recent.filter(rec => this.existingRecentIds.indexOf(rec.id) > -1);
          this.addRecentlyViewedToDashboard(recent);
        });
      });
    });

  }

  private addRecentlyViewedToDashboard(recent: any[]) {
    for (const item of recent) {
      switch (item.type) {
        case 'Vo': {
          this.items.push({
            cssIcon: 'perun-vo',
            url: `/organizations/${item.id}`,
            label: item.name,
            tooltip: item.name,
            style: 'vo-btn',
            type: 'Organization'
          });
          break;
        }
        case 'Group': {
          this.items.push({
            cssIcon: 'perun-group',
            url: `/organizations/${item.voId}/groups/${item.id}`,
            label: item.name,
            tooltip: `${item.voName} : ${item.fullName.replace(/:/g, " : ")}`,
            style: 'group-btn',
            type: 'Group'
          });
          break;
        }
        case 'Facility': {
          this.items.push({
            cssIcon: 'perun-facility-white',
            url: `/facilities/${item.id}`,
            label: item.name,
            tooltip: item.name,
            style: 'facility-btn',
            type: 'Facility'
          });
          break;
        }
      }

    }
  }
}
