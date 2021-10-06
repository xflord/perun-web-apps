import { Component, HostBinding, OnInit } from '@angular/core';
import {
  TABLE_ADMIN_USER_SELECT,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { Urns } from '@perun-web-apps/perun/urns';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {

  static id = 'AdminUsersComponent';

  @HostBinding('class.router-component') true;

  constructor(
    private storeService: StoreService,
    private tableConfigService: TableConfigService
  ) { }

  usersWithoutVo = false;
  searchString: string;
  pageSize: number;
  tableId = TABLE_ADMIN_USER_SELECT;
  attributes: string[] = [];

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.attributes = [
      Urns.USER_DEF_ORGANIZATION,
      Urns.USER_DEF_PREFERRED_MAIL];
    this.attributes = this.attributes.concat(this.storeService.getLoginAttributeNames());
  }

  onSearchByString(searchString: string) {
    this.searchString = searchString;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  findUsersWithoutVO() {
    this.usersWithoutVo = !this.usersWithoutVo;
  }
}
