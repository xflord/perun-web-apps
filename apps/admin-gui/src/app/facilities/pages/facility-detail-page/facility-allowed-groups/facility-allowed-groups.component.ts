import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FacilitiesManagerService, Facility, Group, Vo } from '@perun-web-apps/perun/openapi';
import { TABLE_FACILITY_ALLOWED_GROUPS } from '@perun-web-apps/config/table-config';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-allowed-groups',
  templateUrl: './facility-allowed-groups.component.html',
  styleUrls: ['./facility-allowed-groups.component.scss'],
})
export class FacilityAllowedGroupsComponent implements OnInit {
  static id = 'FacilityAllowedGroupsComponent';

  @HostBinding('class.router-component') true;

  constructor(
    private facilityManager: FacilitiesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  facility: Facility;

  vos: Vo[];

  loading: boolean;

  filterValue = '';

  @Input()
  groups: Group[] = [];
  selected = 'all';

  groupsToShow: Group[] = this.groups;
  tableId = TABLE_FACILITY_ALLOWED_GROUPS;

  groupsWithoutRouteAuth: Set<number> = new Set<number>();

  ngOnInit() {
    this.loading = true;
    this.facility = this.entityStorageService.getEntity();
    this.facilityManager.getAllowedVos(this.facility.id).subscribe((vos) => {
      this.vos = vos;
      this.refreshTable();
    });
  }

  showGroup() {
    if (this.selected !== 'all') {
      this.groupsToShow = this.groups.filter((t) => t.voId === parseInt(this.selected, 10));
    } else {
      this.groupsToShow = this.groups;
    }
  }

  refreshTable() {
    this.loading = true;
    this.groups = [];
    this.vos.forEach((vo) => {
      this.facilityManager.getAllowedGroups(this.facility.id, vo.id).subscribe((group) => {
        this.groups = this.groups.concat(group);
        this.groupsToShow = this.groups;
        this.setAuthRights(vo, group);
        this.loading = false;
      });
    });
    if (this.vos.length === 0) {
      this.loading = false;
    }
  }

  setAuthRights(vo: Vo, groups: Group[]) {
    groups.forEach((grp) => {
      if (!this.authResolver.isAuthorized('getGroupById_int_policy', [vo, grp])) {
        this.groupsWithoutRouteAuth.add(grp.id);
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
