import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { TranslateService } from '@ngx-translate/core';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  MembersManagerService,
  RichMember,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-member-detail-page',
  templateUrl: './member-detail-page.component.html',
  styleUrls: ['./member-detail-page.component.scss'],
  animations: [fadeIn],
})
export class MemberDetailPageComponent implements OnInit {
  vo: Vo;
  member: RichMember;
  fullName = '';
  isAuthorized = false;
  loading = false;

  constructor(
    private sideMenuItemService: SideMenuItemService,
    private translate: TranslateService,
    private sideMenuService: SideMenuService,
    private membersService: MembersManagerService,
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private authResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe((params) => {
      const voId = Number(params['voId']);
      const memberId = Number(params['memberId']);
      this.isAuthorized = this.authResolver.isPerunAdminOrObserver();

      this.voService.getVoById(voId).subscribe(
        (vo) => {
          this.vo = vo;
          this.membersService.getRichMemberWithAttributes(memberId).subscribe(
            (member) => {
              this.member = member;
              const voSideMenuItem = this.sideMenuItemService.parseVo(this.vo);
              const memberSideMenuItem = this.sideMenuItemService.parseMember(this.member, this.vo);
              this.fullName = memberSideMenuItem.label;
              this.sideMenuService.setAccessMenuItems([voSideMenuItem, memberSideMenuItem]);
              this.loading = false;
            },
            () => (this.loading = false)
          );
        },
        () => (this.loading = false)
      );
    });
  }
}
