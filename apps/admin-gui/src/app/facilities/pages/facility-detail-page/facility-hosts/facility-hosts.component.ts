import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FacilitiesManagerService, Facility, Host } from '@perun-web-apps/perun/openapi';
import {
  TABLE_FACILITY_HOSTS_LIST,
} from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddHostDialogComponent } from '../../../../shared/components/dialogs/add-host-dialog/add-host-dialog.component';
import { RemoveHostDialogComponent } from '../../../../shared/components/dialogs/remove-host-dialog/remove-host-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-hosts',
  templateUrl: './facility-hosts.component.html',
  styleUrls: ['./facility-hosts.component.scss']
})

export class FacilityHostsComponent implements OnInit {

  constructor(private dialog: MatDialog,
              private facilitiesManager: FacilitiesManagerService,
              private authResolver: GuiAuthResolver,
              private entityStorageService: EntityStorageService) {

  }

  @Input()
  disableRouting = false;
  facility: Facility;
  hosts: Host[] = [];
  selected = new SelectionModel<Host>(true, []);
  loading: boolean;
  filterValue = '';
  tableId = TABLE_FACILITY_HOSTS_LIST;
  displayedColumns: string[] = ['id', 'name'];
  @Output()
  hostEmitter: EventEmitter<Host[]> = new EventEmitter<Host[]>();

  addAuth: boolean;
  removeAuth: boolean;
  routeAuth: boolean;

  ngOnInit(): void {
    this.loading = true;
    this.facility = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.facilitiesManager.getFacilityById(this.facility.id).subscribe(facility => {
      this.facility = facility;
      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.facilitiesManager.getHosts(this.facility.id).subscribe(hosts => {
      this.hosts = hosts;
      this.hostEmitter.emit(this.hosts);
      this.selected.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights(){
    this.addAuth = this.authResolver.isAuthorized('addHosts_Facility_List<String>_policy', [this.facility]);
    this.removeAuth = this.authResolver.isAuthorized('removeHosts_List<Host>_Facility_policy', [this.facility]);

    this.displayedColumns = this.removeAuth ? ['select', 'id', 'name'] : ['id', 'name'];

    if(this.hosts.length !== 0){
      this.routeAuth = this.authResolver.isAuthorized('getHostById_int_policy', [this.facility, this.hosts[0]]);
    }
  }

  addHost() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      facilityId: this.facility.id,
      facilityName: this.facility.name,
      theme: 'facility-theme'
    };

    const dialogRef = this.dialog.open(AddHostDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  removeHost() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      facilityId: this.facility.id,
      theme: 'facility-theme',
      hosts: this.selected.selected
    };

    const dialogRef = this.dialog.open(RemoveHostDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
