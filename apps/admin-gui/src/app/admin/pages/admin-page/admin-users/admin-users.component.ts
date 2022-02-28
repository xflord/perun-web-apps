import { Component, HostBinding, OnInit } from '@angular/core';
import { TABLE_ADMIN_USER_SELECT } from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  static id = 'AdminUsersComponent';

  @HostBinding('class.router-component') true;

  usersWithoutVo = false;
  searchString: string;
  tableId = TABLE_ADMIN_USER_SELECT;
  attributes: string[] = [];

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.attributes = [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL];
    this.attributes = this.attributes.concat(this.storeService.getLoginAttributeNames());
  }

  onSearchByString(searchString: string): void {
    this.searchString = searchString;
  }

  findUsersWithoutVO(): void {
    this.usersWithoutVo = !this.usersWithoutVo;
  }
}
