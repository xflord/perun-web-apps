import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FacilitiesManagerService, Facility, SecurityTeam } from '@perun-web-apps/perun/openapi';
import { TABLE_FACILITY_SECURITY_TEAMS_LIST } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-security-teams',
  templateUrl: './facility-security-teams.component.html',
  styleUrls: ['./facility-security-teams.component.scss'],
})
export class FacilitySecurityTeamsComponent implements OnInit {
  facility: Facility;
  securityTeams: SecurityTeam[] = [];
  selected = new SelectionModel<SecurityTeam>(true, []);

  filterValue = '';

  loading: boolean;
  tableId = TABLE_FACILITY_SECURITY_TEAMS_LIST;
  displayedColumns: string[] = [];

  addAuth: boolean;
  removeAuth: boolean;

  constructor(
    private dialog: MatDialog,
    private facilitiesManager: FacilitiesManagerService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.facility = this.entityStorageService.getEntity();
    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.facilitiesManager.getAssignedSecurityTeams(this.facility.id).subscribe((securityTeams) => {
      this.securityTeams = securityTeams;
      this.selected.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights(): void {
    this.addAuth = this.authResolver.isAuthorized(
      'assignSecurityTeam_Facility_SecurityTeam_policy',
      [this.facility]
    );
    this.removeAuth = this.authResolver.isAuthorized(
      'removeSecurityTeam_Facility_SecurityTeam_policy',
      [this.facility]
    );

    this.displayedColumns = this.removeAuth
      ? ['select', 'id', 'name', 'description']
      : ['id', 'name', 'description'];
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
