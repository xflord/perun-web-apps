import { Component, OnInit } from '@angular/core';
import {
  BanOnFacility,
  FacilitiesManagerService,
  User,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { TABLE_FACILITY_BLACKLIST_LIST } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-perun-web-apps-facility-settings-blacklist',
  templateUrl: './facility-settings-blacklist.component.html',
  styleUrls: ['./facility-settings-blacklist.component.scss']
})
export class FacilitySettingsBlacklistComponent implements OnInit {

  constructor(private facilitiesManager: FacilitiesManagerService,
              private usersManager: UsersManagerService,
              private route: ActivatedRoute) {
  }

  bansOnFacilitiesWithUsers: [BanOnFacility, User][] = [];
  selected = new SelectionModel<[BanOnFacility, User]>(true, []);
  filterValue = '';
  loading: boolean;
  tableId = TABLE_FACILITY_BLACKLIST_LIST;


  ngOnInit(): void {
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(parentParentParams => {
      const facilityId = parentParentParams['facilityId'];

      this.facilitiesManager.getBansForFacility(facilityId).subscribe(bansOnFacility => {
        const listOfBans: BanOnFacility[] = bansOnFacility;
        for (const ban of listOfBans) {
          let user: User;
          this.usersManager.getUserById(ban.userId).subscribe(subscriptionUser => {
            user = subscriptionUser;
          });
          this.bansOnFacilitiesWithUsers.push([ban, user]);
        }
        this.selected.clear();
        this.loading = false;
      });
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
