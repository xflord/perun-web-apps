import { Component, OnInit } from '@angular/core';
import {
  MembersManagerService,
  PerunPrincipal,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { Membership } from '../../components/membership-list/membership-list.component';

@Component({
  selector: 'perun-web-apps-vos-page',
  templateUrl: './vos-page.component.html',
  styleUrls: ['./vos-page.component.scss'],
})
export class VosPageComponent implements OnInit {
  principal: PerunPrincipal;
  loading: boolean;
  userId: number;
  filterValue = '';

  userMemberships: Membership[] = [];
  adminMemberships: Membership[] = [];
  userMembershipsTemp: Membership[] = [];
  adminMembershipsTemp: Membership[] = [];

  vosCount = 0;

  constructor(
    private usersService: UsersManagerService,
    private store: StoreService,
    private membersService: MembersManagerService,
  ) {}

  ngOnInit(): void {
    this.principal = this.store.getPerunPrincipal();
    this.userId = this.principal.user.id;

    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.usersService.getVosWhereUserIsMember(this.userId).subscribe((vosMember) => {
      this.usersService.getVosWhereUserIsAdmin(this.userId).subscribe((vosAdmin) => {
        this.vosCount = vosMember.length + vosAdmin.length;
        this.fillMemberships(vosMember, this.userMembershipsTemp);
        this.fillMemberships(vosAdmin, this.adminMembershipsTemp);
      });
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  isEverythingLoaded(): void {
    this.vosCount--;
    this.loading = this.vosCount !== 0;
    if (!this.loading) {
      this.userMemberships = this.userMembershipsTemp;
      this.adminMemberships = this.adminMembershipsTemp;
    }
  }

  extendMembership(membership: Membership): void {
    const registrarUrl = this.store.getProperty('registrar_base_url');
    window.location.href = `${registrarUrl}?vo=${membership.entity.shortName}`;
  }

  private fillMemberships(vos: Array<Vo>, memberships: Membership[]): void {
    this.membersService.getMembersByUser(this.userId).subscribe((members) => {
      if (vos.length === 0) this.loading = false;
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
              (att) => att.friendlyName === 'membershipExpiration',
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
}
