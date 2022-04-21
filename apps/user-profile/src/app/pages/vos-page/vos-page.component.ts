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
  principal: PerunPrincipal;
  loading: boolean;
  userId: number;
  filterValue = '';
  selection = new SelectionModel<Membership>(false, []);

  userMemberships: Membership[] = [];
  adminMemberships: Membership[] = [];

  vosCount = 0;

  constructor(
    private usersService: UsersManagerService,
    private store: StoreService,
    private membersService: MembersManagerService
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
        this.fillMemberships(vosMember, this.userMemberships);
        this.fillMemberships(vosAdmin, this.adminMemberships);
      });
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  isEverythingLoaded(): void {
    this.vosCount--;
    this.loading = this.vosCount !== 0;
  }

  extendMembership(membership: Membership): void {
    const registrarUrl = this.store.get('registrar_base_url') as string;
    window.location.href = `${registrarUrl}?vo=${membership.entity.shortName}`;
  }

  private fillMemberships(vos: Array<Vo>, memberships: Membership[]): void {
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
}
