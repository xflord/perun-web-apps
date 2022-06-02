import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Member, MembersManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-member-attributes',
  templateUrl: './member-attributes.component.html',
  styleUrls: ['./member-attributes.component.scss'],
})
export class MemberAttributesComponent implements OnInit {
  @HostBinding('class.router-component') true;
  memberId: number;
  member: Member;
  memberResourceAttAuth: boolean;
  memberGroupAttAuth: boolean;
  userFacilityAttAuth: boolean;

  constructor(
    private route: ActivatedRoute,
    private authResolver: GuiAuthResolver,
    private memberManager: MembersManagerService
  ) {}

  ngOnInit(): void {
    this.route.parent.params.subscribe((params) => {
      this.memberId = Number(params['memberId']);

      this.memberManager.getMemberById(this.memberId).subscribe((member) => {
        this.member = member;

        this.memberGroupAttAuth = this.authResolver.isAuthorized('getMemberGroups_Member_policy', [
          this.member,
        ]);
        this.memberResourceAttAuth = this.authResolver.isAuthorized(
          'getAssignedResourcesWithStatus_Member_policy',
          [this.member]
        );
        this.userFacilityAttAuth = this.authResolver.isAuthorized(
          'getAssignedFacilities_User_policy',
          [{ beanName: 'User', id: member.userId }]
        );
      });
    });
  }
}
