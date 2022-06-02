import { Component, HostBinding, OnInit } from '@angular/core';
import {
  AuthzResolverService,
  EnrichedFacility,
  FacilitiesManagerService,
  Group,
  GroupsManagerService,
  MembersManagerService,
  PerunPrincipal,
  ResourcesManagerService,
  RichMember,
  RichResource,
  User,
  UsersManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
})
export class UserRolesComponent implements OnInit {
  @HostBinding('class.router-component') true;
  currentIds: number[] = [];

  userId: number;

  roles: Map<string, Map<string, Array<number>>> = new Map<string, Map<string, Array<number>>>();
  principal: PerunPrincipal;

  isSelf: boolean;
  isGroupAdmin: boolean;
  isVoAdmin: boolean;
  isResourceAdmin: boolean;
  isFacilityAdmin: boolean;
  isTopGroupCreator: boolean;
  hasSponsorship: boolean;
  isSponsor: boolean;
  isResourceSelfService: boolean;
  isVoObserver: boolean;
  isResourceObserver: boolean;
  isGroupObserver: boolean;
  isTrustedFacilityAdmin: boolean;
  isFacilityObserver: boolean;
  isPerunAdmin: boolean;
  isPerunObserver: boolean;

  roleFilter = [
    'SELF',
    'GROUPADMIN',
    'VOADMIN',
    'RESOURCEADMIN',
    'FACILITYADMIN',
    'TOPGROUPCREATOR',
    'SPONSORSHIP',
    'SPONSOR',
    'RESOURCESELFSERVICE',
    'VOOBSERVER',
    'RESOURCEOBSERVER',
    'GROUPOBSERVER',
    'TRUSTEDFACILITYADMIN',
    'FACILITYOBSERVER',
    'PERUNADMIN',
    'PERUNOBSERVER',
  ];
  roleNames: string[] = [];
  groups: Group[] = [];
  vos: Vo[] = [];
  facilities: EnrichedFacility[] = [];
  users: User[] = [];
  resources: RichResource[] = [];
  members: RichMember[] = [];
  outerLoading: boolean;
  loading: boolean;
  showDescription: boolean;

  constructor(
    private authzResolverService: AuthzResolverService,
    private usersManagerService: UsersManagerService,
    private vosManagerService: VosManagerService,
    private facilitiesManagerService: FacilitiesManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private membersManagerService: MembersManagerService,
    private groupsManagerService: GroupsManagerService,
    private route: ActivatedRoute,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.outerLoading = true;
    this.route.parent.params.subscribe((params) => {
      if (params['userId']) {
        this.userId = Number(params['userId']);
        this.authzResolverService.getUserRoleNames(this.userId).subscribe((roleNames) => {
          this.roleNames = roleNames.map((elem) => elem.toUpperCase());
          this.authzResolverService.getUserRoles(this.userId).subscribe((roles) => {
            this.prepareRoles(roles);
          });
        });
      } else {
        this.showDescription = true;
        this.principal = this.store.getPerunPrincipal();
        this.userId = this.principal.userId;
        this.roleNames = Object.keys(this.principal.roles);
        this.prepareRoles(this.principal.roles);
      }
    });
  }

  getAdminGroupsAndVos(): void {
    this.loading = true;
    this.groups = [];
    this.usersManagerService.getGroupsWhereUserIsAdmin(this.userId).subscribe((groups) => {
      this.groups = groups;
      const voIds = [...new Set(this.groups.map((group) => group.voId))];
      this.getVos(voIds);
    });
  }

  getVos(voIds: number[]): void {
    this.loading = true;
    this.vos = [];
    this.vosManagerService.getVosByIds(voIds).subscribe((vos) => {
      this.vos = vos;
      this.loading = false;
    });
  }

  getInnerKeys(role: string): void {
    if (this.roles.get(role)) {
      const it = this.roles.get(role).entries();
      const result: number[] = [];
      let val: number = it.next().value as number;
      while (val) {
        result.push(val);
        val = it.next().value as number;
      }
      this.currentIds = result;
    } else {
      this.currentIds = [];
    }
  }

  getAdminVos(): void {
    this.loading = true;
    this.vos = [];
    this.usersManagerService.getVosWhereUserIsAdmin(this.userId).subscribe((vos) => {
      this.vos = vos;
      this.loading = false;
    });
  }

  getAdminFacilities(): void {
    this.loading = true;
    this.facilities = [];
    this.facilitiesManagerService
      .getFacilitiesWhereUserIsAdmin(this.userId)
      .subscribe((facilities) => {
        this.facilities = facilities.map((f) => ({ facility: f }));
        this.loading = false;
      });
  }

  getSelfData(): void {
    this.loading = true;
    this.vos = [];
    this.users = [];
    this.usersManagerService.getVosWhereUserIsMember(this.userId).subscribe((vos) => {
      this.vos = vos;

      const ids = this.roles.get('SELF').get('User');
      if (!ids) {
        this.loading = false;
      } else {
        this.usersManagerService.getUsersByIds(ids).subscribe((users) => {
          this.users = users;
          this.loading = false;
        });
      }
    });
  }

  getResourcesData(role: string): void {
    this.loading = true;
    const resourceIds = this.roles.get(role).get('Resource');
    this.vos = [];
    this.facilities = [];
    this.resources = [];
    this.resourcesManagerService.getRichResourcesByIds(resourceIds).subscribe((resources) => {
      this.resources = resources;
      this.vos = this.resources
        .map((res) => res.vo)
        .filter((item, i, ar) => ar.indexOf(item) === i);
      this.facilities = this.resources
        .map((res) => ({ facility: res.facility }))
        .filter((item, i, ar) => ar.indexOf(item) === i);
      this.loading = false;
    });
  }

  getMembers(): void {
    this.loading = true;
    const memberIds = this.roles.get('SPONSORSHIP').get('Member');
    this.members = [];
    this.membersManagerService.getRichMembersByIds(memberIds).subscribe((members) => {
      this.members = members;
      this.loading = false;
    });
  }

  getGroupsAndVos(role: string): void {
    this.loading = true;
    const voIds = this.roles.get(role).get('Vo');
    const groupIds = this.roles.get(role).get('Group');
    this.vos = [];
    this.groups = [];
    this.groupsManagerService.getGroupsByIds(groupIds).subscribe((groups) => {
      this.groups = groups;

      this.vosManagerService.getVosByIds(voIds).subscribe((vos) => {
        this.vos = vos;
        this.loading = false;
      });
    });
  }

  getFacilities(role: string): void {
    this.loading = true;
    this.facilities = [];
    const facilityIds = this.roles.get(role).get('Facility');
    this.facilitiesManagerService.getFacilitiesByIds(facilityIds).subscribe((facilities) => {
      this.facilities = facilities.map((f) => ({ facility: f }));
      this.loading = false;
    });
  }

  private prepareRoles(roles: { [p: string]: { [p: string]: Array<number> } }): void {
    this.roleNames.forEach((roleName) => {
      const innerMap = new Map<string, Array<number>>();
      const innerRoles = Object.keys(roles[roleName]);

      innerRoles.forEach((innerRole) => {
        innerMap.set(innerRole, roles[roleName][innerRole]);
      });
      switch (roleName) {
        case 'SELF':
          this.isSelf = true;
          break;
        case 'GROUPADMIN':
          this.isGroupAdmin = true;
          break;
        case 'VOADMIN':
          this.isVoAdmin = true;
          break;
        case 'RESOURCEADMIN':
          this.isResourceAdmin = true;
          break;
        case 'FACILITYADMIN':
          this.isFacilityAdmin = true;
          break;
        case 'TOPGROUPCREATOR':
          this.isTopGroupCreator = true;
          break;
        case 'SPONSORSHIP':
          this.hasSponsorship = true;
          break;
        case 'SPONSOR':
          this.isSponsor = true;
          break;
        case 'RESOURCESELFSERVICE':
          this.isResourceSelfService = true;
          break;
        case 'VOOBSERVER':
          this.isVoObserver = true;
          break;
        case 'RESOURCEOBSERVER':
          this.isResourceObserver = true;
          break;
        case 'GROUPOBSERVER':
          this.isGroupObserver = true;
          break;
        case 'TRUSTEDFACILITYADMIN':
          this.isTrustedFacilityAdmin = true;
          break;
        case 'FACILITYOBSERVER':
          this.isFacilityObserver = true;
          break;
        case 'PERUNADMIN':
          this.isPerunAdmin = true;
          break;
        case 'PERUNOBSERVER':
          this.isPerunObserver = true;
          break;
      }

      this.roles.set(roleName, innerMap);
    });
    this.roleNames = this.roleNames.filter((role) => !this.roleFilter.includes(role));
    this.outerLoading = false;
  }
}
