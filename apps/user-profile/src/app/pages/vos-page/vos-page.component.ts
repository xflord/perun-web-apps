import { Component, OnInit } from '@angular/core';
import {
  MembersManagerService,
  PerunPrincipal,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { Membership } from '../../components/membership-list/membership-list.component';

@Component({
  selector: 'perun-web-apps-vos-page',
  templateUrl: './vos-page.component.html',
  styleUrls: ['./vos-page.component.scss'],
})
export class VosPageComponent implements OnInit {
  constructor(
    private usersService: UsersManagerService,
    private store: StoreService,
    private membersService: MembersManagerService
  ) {}

  principal: PerunPrincipal;
  loading: boolean;
  userId: number;
  filterValue = '';
  selection = new SelectionModel<Membership>(false, []);

  userMemberships: Membership[] = [];
  adminMemberships: Membership[] = [];

  vosCount = 0;

  ngOnInit() {
    this.principal = this.store.getPerunPrincipal();
    this.userId = this.principal.user.id;

    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.usersService.getVosWhereUserIsMember(this.userId).subscribe((vosMember) => {
      this.usersService.getVosWhereUserIsAdmin(this.userId).subscribe((vosAdmin) => {
        this.vosCount = vosMember.length + vosAdmin.length;
        this.fillMemberships(vosMember, this.userMemberships);
        this.fillMemberships(vosAdmin, this.adminMemberships);
      });
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  isEverythingLoaded() {
    this.vosCount--;
    this.loading = this.vosCount !== 0;
  }

  private fillMemberships(vos: Array<Vo>, memberships: Membership[]) {
    this.membersService.getMembersByUser(this.userId).subscribe((members) => {
      vos.forEach((vo) => {
        const member = members.find((mem) => mem.voId === vo.id);
        if (!member) {
          memberships.push({
            entity: vo,
            expirationAttribute: null,
          });
          this.isEverythingLoaded();
        } else {
          this.membersService.getRichMemberWithAttributes(member.id).subscribe((richMember) => {
            const expirationAtt = richMember.memberAttributes.find(
              (att) => att.friendlyName === 'membershipExpiration'
            );
            memberships.push({
              entity: vo,
              expirationAttribute: expirationAtt,
            });
            this.isEverythingLoaded();
          });
        }
      });
    });
  }

  extendMembership(membership: Membership) {
    const registrarUrl = this.store.get('registrar_base_url');
    window.location.href = `${registrarUrl}?vo=${membership.entity.shortName}`;
  }
}
