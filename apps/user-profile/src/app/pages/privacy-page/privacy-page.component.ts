import { Component, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  MembersManagerService,
  RichUser,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'perun-web-apps-privacy-page',
  templateUrl: './privacy-page.component.html',
  styleUrls: ['./privacy-page.component.scss'],
})
export class PrivacyPageComponent implements OnInit {
  vos: Vo[] = [];
  userId: number;
  user: RichUser;
  attributes: Attribute[] = [];
  username = '';
  hiddenColumns = ['select', 'id'];
  outerLoading: boolean;
  innerLoading: boolean;
  filteredVos: Vo[] = [];

  constructor(
    private usersManagerService: UsersManagerService,
    private membersService: MembersManagerService,
    private attributesManagerService: AttributesManagerService,
    private storage: StoreService
  ) {}

  ngOnInit(): void {
    this.outerLoading = true;
    this.userId = this.storage.getPerunPrincipal().userId;
    this.usersManagerService.getVosWhereUserIsMember(this.userId).subscribe((vos) => {
      this.vos = vos;
      this.filteredVos = vos;
      this.outerLoading = false;
    });
  }

  getUserData(): void {
    this.innerLoading = true;
    this.usersManagerService.getRichUserWithAttributes(this.userId).subscribe((user) => {
      this.user = user;
      this.attributes = user.userAttributes;
      this.username = new UserFullNamePipe().transform(user);
      this.innerLoading = false;
    });
  }

  getMemberData(vo: Vo): void {
    this.innerLoading = true;
    this.membersService.getMemberByUser(vo.id, this.userId).subscribe((member) => {
      this.membersService.getRichMemberWithAttributes(member.id).subscribe((richMember) => {
        this.attributes = richMember.memberAttributes;
        this.innerLoading = false;
      });
    });
  }

  applyFilter(filter: string): void {
    this.filteredVos = this.vos.filter((res) =>
      res.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
}
