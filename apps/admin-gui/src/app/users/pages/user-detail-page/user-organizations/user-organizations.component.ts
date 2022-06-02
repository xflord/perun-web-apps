import { Component, HostBinding, OnInit } from '@angular/core';
import { UsersManagerService, Vo } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import {
  TABLE_USER_PROFILE_ADMIN_SELECT,
  TABLE_USER_PROFILE_MEMBER_SELECT,
} from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-organizations',
  templateUrl: './user-organizations.component.html',
  styleUrls: ['./user-organizations.component.scss'],
})
export class UserOrganizationsComponent implements OnInit {
  @HostBinding('class.router-component') true;
  vosWhereIsAdmin: Vo[];
  vosWhereIsMember: Vo[];
  memberRefresh: boolean;
  adminRefresh: boolean;
  userId: number;
  adminFilterValue = '';
  memberFilterValue = '';
  displayedColumns = ['id', 'name'];
  adminTableId = TABLE_USER_PROFILE_ADMIN_SELECT;
  memberTableId = TABLE_USER_PROFILE_MEMBER_SELECT;
  isMyProfile: boolean;

  constructor(
    private usersService: UsersManagerService,
    private authResolver: GuiAuthResolver,
    private store: StoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if ((this.isMyProfile = this.route.snapshot.data.showPrincipal as boolean)) {
      this.userId = this.store.getPerunPrincipal().user.id;
    } else {
      this.route.parent.params.subscribe((params) => (this.userId = Number(params['userId'])));
    }
    this.refreshAdminTable();
    this.refreshMemberTable();
  }

  refreshMemberTable(): void {
    this.memberRefresh = true;
    this.usersService.getVosWhereUserIsMember(this.userId).subscribe(
      (vosMember) => {
        this.vosWhereIsMember = vosMember;
        this.memberRefresh = false;
      },
      () => (this.memberRefresh = false)
    );
  }

  refreshAdminTable(): void {
    this.adminRefresh = true;
    this.usersService.getVosWhereUserIsAdmin(this.userId).subscribe(
      (vosAdmin) => {
        this.vosWhereIsAdmin = vosAdmin;
        this.adminRefresh = false;
      },
      () => (this.adminRefresh = false)
    );
  }

  applyMemberFilter(filterValue: string): void {
    this.memberFilterValue = filterValue;
  }

  applyAdminFilter(filterValue: string): void {
    this.adminFilterValue = filterValue;
  }
}
