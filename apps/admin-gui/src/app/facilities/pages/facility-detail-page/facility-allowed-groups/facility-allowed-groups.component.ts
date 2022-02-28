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

  @Input()
  groups: Group[] = [];

  @HostBinding('class.router-component') true;

  facility: Facility;

  vos: Vo[];

  loading: boolean;

  filterValue = '';

  selected = 'all';

  groupsToShow: Group[] = this.groups;
  tableId = TABLE_FACILITY_ALLOWED_GROUPS;

  groupsWithoutRouteAuth: Set<number> = new Set<number>();

  constructor(
    private facilityManager: FacilitiesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.facility = this.entityStorageService.getEntity();
    this.facilityManager.getAllowedVos(this.facility.id).subscribe((vos) => {
      this.vos = vos;
      this.refreshTable();
    });
  }

  showGroup(): void {
    if (this.selected !== 'all') {
      this.groupsToShow = this.groups.filter((t) => t.voId === parseInt(this.selected, 10));
    } else {
      this.groupsToShow = this.groups;
    }
  }

  refreshTable(): void {
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

  setAuthRights(vo: Vo, groups: Group[]): void {
    groups.forEach((grp) => {
      if (!this.authResolver.isAuthorized('getGroupById_int_policy', [vo, grp])) {
        this.groupsWithoutRouteAuth.add(grp.id);
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
