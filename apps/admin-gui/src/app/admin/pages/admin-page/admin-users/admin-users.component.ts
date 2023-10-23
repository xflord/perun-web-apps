import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import { TABLE_ADMIN_USER_SELECT } from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';
import { StoreService } from '@perun-web-apps/perun/services';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  static id = 'AdminUsersComponent';

  @HostBinding('class.router-component') true;

  loading$: Observable<boolean>;
  usersWithoutVo = false;
  searchString: string;
  tableId = TABLE_ADMIN_USER_SELECT;
  attributes: string[] = [];
  update = false;

  constructor(
    private storeService: StoreService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading$ = of(true);
    this.attributes = [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL];
    this.attributes = this.attributes.concat(this.storeService.getLoginAttributeNames());
  }

  onSearchByString(searchString: string): void {
    this.searchString = searchString;
    this.cd.detectChanges();
  }

  findUsersWithoutVO(): void {
    this.usersWithoutVo = !this.usersWithoutVo;
    this.cd.detectChanges();
  }

  refresh(): void {
    this.update = !this.update;
    this.cd.detectChanges();
  }
}
