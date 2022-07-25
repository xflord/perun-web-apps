import { Component, Input } from '@angular/core';
import {
  AuthzResolverService,
  EnrichedFacility,
  FacilitiesManagerService,
  Group,
  GroupsManagerService,
  MembersManagerService,
  ResourcesManagerService,
  RichMember,
  RichResource,
  RichUser,
  UsersManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-perun-web-apps-roles-page',
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.scss'],
})
export class RolesPageComponent {
  @Input()
  roles: Map<string, Map<string, Array<number>>> = new Map<string, Map<string, Array<number>>>();

  @Input()
  outerLoading: boolean;

  @Input()
  showDescription: boolean;

  @Input()
  roleNames: string[];

  @Input()
  entityId: number;

  @Input()
  entityType: 'SELF' | 'USER' | 'GROUP';

  groups: Group[] = [];
  vos: Vo[] = [];
  facilities: EnrichedFacility[] = [];
  resources: RichResource[] = [];
  members: RichMember[] = [];
  users: RichUser[] = [];
  currentIds: number[] = [];
  loading: boolean;

  constructor(
    private authzResolverService: AuthzResolverService,
    private usersManagerService: UsersManagerService,
    private vosManagerService: VosManagerService,
    private facilitiesManagerService: FacilitiesManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private groupsManagerService: GroupsManagerService,
    private membersManagerService: MembersManagerService
  ) {}

  getGroups(groupIds: number[]): void {
    this.loading = true;
    this.groups = [];
    this.groupsManagerService.getGroupsByIds(groupIds).subscribe((groups) => {
      this.groups = groups;
      this.loading = false;
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

  getFacilities(facilityIds: number[]): void {
    this.loading = true;
    this.facilities = [];
    this.facilitiesManagerService.getFacilitiesByIds(facilityIds).subscribe((facilities) => {
      this.facilities = facilities.map((f) => ({ facility: f }));
      this.loading = false;
    });
  }

  getResources(resourceIds: number[]): void {
    this.loading = true;
    this.resources = [];
    this.resourcesManagerService.getRichResourcesByIds(resourceIds).subscribe((resources) => {
      this.resources = resources;
      this.loading = false;
    });
  }

  getMembers(memberIds: number[]): void {
    this.loading = true;
    this.members = [];
    this.membersManagerService.getRichMembersByIds(memberIds).subscribe((members) => {
      this.members = members;
      this.loading = false;
    });
  }

  getSelfData(userIds: number[]): void {
    this.loading = true;
    this.vos = [];
    this.users = [];
    this.usersManagerService.getVosWhereUserIsMember(this.entityId).subscribe((vos) => {
      this.vos = vos;
      const ids = [this.entityId].concat(userIds);
      this.usersManagerService.getRichUsersByIds(ids).subscribe((users) => {
        this.users = users;
        this.loading = false;
      });
    });
  }

  getMembershipData(
    groupIds: number[],
    voIds: number[],
    resourceIds: number[],
    facilityIds: number[]
  ): void {
    this.loading = true;
    this.vos = [];
    this.resources = [];
    this.groups = [];
    this.facilities = [];
    this.getResourcesIfArrayNotEmpty(resourceIds)
      .then(() =>
        this.getFacilitiesIfArrayNotEmpty(facilityIds)
          .then(() =>
            this.getVosIfArrayNotEmpty(voIds)
              .then(() =>
                this.getGroupsIfArrayNotEmpty(groupIds)
                  .then(() => (this.loading = false))
                  .catch((error) => console.error(error))
              )
              .catch((error) => console.error(error))
          )
          .catch((error) => console.error(error))
      )
      .catch((error) => console.error(error));
  }

  getResourcesIfArrayNotEmpty(resourceIds: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (resourceIds && resourceIds.length !== 0) {
        this.resourcesManagerService.getRichResourcesByIds(resourceIds).subscribe((resources) => {
          this.resources = resources;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getFacilitiesIfArrayNotEmpty(facilityIds: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (facilityIds && facilityIds.length !== 0) {
        this.facilitiesManagerService.getFacilitiesByIds(facilityIds).subscribe((facilities) => {
          this.facilities = facilities.map((f) => ({ facility: f }));
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getVosIfArrayNotEmpty(voIds: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (voIds && voIds.length !== 0) {
        this.vosManagerService.getVosByIds(voIds).subscribe((vos) => {
          this.vos = vos;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getGroupsIfArrayNotEmpty(groupIds: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (groupIds && groupIds.length !== 0) {
        this.groupsManagerService.getGroupsByIds(groupIds).subscribe((groups) => {
          this.groups = groups;
          resolve();
        });
      } else {
        resolve();
      }
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
}
