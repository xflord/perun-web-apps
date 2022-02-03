import { Component, OnInit } from '@angular/core';
import {
  GroupsManagerService,
  Member,
  MembersManagerService,
  RichGroup,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-perun-web-apps-user-accounts',
  templateUrl: './user-accounts.component.html',
  styleUrls: ['./user-accounts.component.css'],
})
export class UserAccountsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private usersService: UsersManagerService,
    private membersService: MembersManagerService,
    private groupService: GroupsManagerService
  ) {}

  initLoading = false;
  loading = false;

  vos: Vo[] = [];
  selectedVo: Vo = null;

  member: Member = null;

  groups: RichGroup[] = [];

  userId: number;
  ngOnInit(): void {
    this.initLoading = true;
    this.route.parent.params.subscribe((params) => {
      this.userId = params['userId'];
      this.usersService.getVosWhereUserIsMember(this.userId).subscribe(
        (vos) => {
          this.vos = vos;
          this.initLoading = false;
        },
        () => (this.initLoading = false)
      );
    });
  }

  loadMember(vo: Vo) {
    this.loading = true;
    this.selectedVo = vo;
    this.membersService.getMemberByUser(this.selectedVo.id, this.userId).subscribe(
      (member) => {
        this.member = member;
        this.groupService
          .getMemberRichGroupsWithAttributesByNames(this.member.id, [
            'urn:perun:member_group:attribute-def:virt:groupStatus',
          ])
          .subscribe(
            (groups) => {
              this.groups = groups;
              this.loading = false;
            },
            () => (this.loading = false)
          );
      },
      () => (this.loading = false)
    );
  }
}
