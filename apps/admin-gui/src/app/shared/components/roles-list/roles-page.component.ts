import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AuthzResolverService,
  EnrichedFacility,
  FacilitiesManagerService,
  Facility,
  Group,
  GroupsManagerService,
  MembersManagerService,
  PerunBean,
  Resource,
  ResourcesManagerService,
  RichMember,
  RichResource,
  RichUser,
  RoleManagementRules,
  UsersManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddGroupRoleDialogComponent } from '../dialogs/add-role-dialog/add-group-role-dialog/add-group-role-dialog.component';
import { AddUserRoleDialogComponent } from '../dialogs/add-role-dialog/add-user-role-dialog/add-user-role-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import {
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { DisplayedRolePipe, ManageableEntitiesPipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'app-perun-web-apps-roles-page',
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.scss'],
  providers: [DisplayedRolePipe, ManageableEntitiesPipe],
})
export class RolesPageComponent implements OnInit {
  @Input() roles = new Map<string, Map<string, Array<number>>>();
  @Input() outerLoading: boolean;
  @Input() showDescription: boolean;
  @Input() roleNames: string[];
  @Input() entityId: number;
  @Input() entityType: 'SELF' | 'USER' | 'GROUP';
  @Output() reload = new EventEmitter<void>();

  groups: Group[] = [];
  vos: Vo[] = [];
  facilities: EnrichedFacility[] = [];
  resources: RichResource[] = [];
  members: RichMember[] = [];
  users: RichUser[] = [];
  selection = new SelectionModel<PerunBean | EnrichedFacility>(false, []);
  currentIds: number[] = [];
  loading: boolean;
  selectedRole: string;
  rules: RoleManagementRules[] = [];
  disableRemove = false;

  constructor(
    private authzResolverService: AuthzResolverService,
    private usersManagerService: UsersManagerService,
    private vosManagerService: VosManagerService,
    private facilitiesManagerService: FacilitiesManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private groupsManagerService: GroupsManagerService,
    private membersManagerService: MembersManagerService,
    private dialog: MatDialog,
    private notification: NotificatorService,
    private translate: PerunTranslateService,
    private rolePipe: DisplayedRolePipe,
    private guiAuthResolver: GuiAuthResolver,
    private manageableEntities: ManageableEntitiesPipe
  ) {}

  ngOnInit(): void {
    this.rules = this.guiAuthResolver.getAssignableRoleRules(
      this.entityType === 'GROUP' ? 'GROUP' : 'USER'
    );

    this.selection.changed.subscribe((change) => {
      const entities = change.source.selected.map((item) => {
        if ('beanName' in item) return item;
        else if ('facility' in item) return item.facility;
      });
      const manageableNum = this.manageableEntities.transform(entities, this.selectedRole).length;
      this.disableRemove = change.source.selected.length !== manageableNum;
    });
  }

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

  addRole(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = { entityId: this.entityId, roles: this.roles };

    let dialogRef: MatDialogRef<AddGroupRoleDialogComponent | AddUserRoleDialogComponent, boolean>;
    if (this.entityType === 'GROUP') {
      dialogRef = this.dialog.open(AddGroupRoleDialogComponent, config);
    } else {
      dialogRef = this.dialog.open(AddUserRoleDialogComponent, config);
    }
    dialogRef.afterClosed().subscribe({
      next: (result: boolean) => {
        if (result) {
          this.outerLoading = true;
          this.refresh();
        }
      },
    });
  }

  openConfirmDialog(role: string, hasCompObj = true): void {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      theme: this.entityType === 'GROUP' ? 'group-theme' : 'user-theme',
      title: 'ROLES.REMOVE',
      description: 'ROLES.REMOVE_DESC',
      items: [this.rolePipe.transform(role)],
      alert: false,
      type: 'remove',
      showAsk: true,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          if (hasCompObj) this.removeRoleWithComplementaryObject(role);
          else this.removeRole(role);
        }
      },
    });
  }

  private removeRole(role: string): void {
    this.outerLoading = true;
    if (this.entityType === 'GROUP') {
      this.authzResolverService
        .unsetRoleForGroup({ role: role, authorizedGroup: this.entityId })
        .subscribe({
          next: () => {
            this.showSuccess(role);
            this.refresh();
          },
          error: () => {
            this.selection.clear();
            this.outerLoading = false;
          },
        });
    } else {
      this.authzResolverService.unsetRoleForUser({ role: role, user: this.entityId }).subscribe({
        next: () => {
          this.showSuccess(role);
          this.refresh();
        },
        error: () => {
          this.selection.clear();
          this.outerLoading = false;
        },
      });
    }
  }

  private removeRoleWithComplementaryObject(role: string): void {
    this.outerLoading = true;
    let assignedObject: PerunBean;
    if ('beanName' in this.selection.selected[0]) {
      assignedObject = this.selection.selected[0];
      if (assignedObject.beanName === 'RichResource') {
        assignedObject = this.parseResource(this.selection.selected[0]);
      }
    } else if ('facility' in this.selection.selected[0]) {
      // Facility list works with Enriched facilities we need just basic facility
      assignedObject = this.parseFacility(this.selection.selected[0]);
    }

    if (this.entityType === 'GROUP') {
      this.authzResolverService
        .unsetRoleWithGroupComplementaryObject({
          role: role,
          complementaryObject: assignedObject,
          authorizedGroups: [this.entityId],
        })
        .subscribe({
          next: () => {
            this.showSuccess(role);
            this.refresh();
          },
          error: () => {
            this.selection.clear();
            this.outerLoading = false;
          },
        });
    } else {
      this.authzResolverService
        .unsetRoleWithUserComplementaryObject({
          role: role,
          complementaryObject: assignedObject,
          users: [this.entityId],
        })
        .subscribe({
          next: () => {
            this.showSuccess(role);
            this.refresh();
          },
          error: () => {
            this.selection.clear();
            this.outerLoading = false;
          },
        });
    }
  }

  private showSuccess(role: string): void {
    this.notification.showSuccess(
      this.translate.instant('ROLES.REMOVE_SUCCESS', { role: this.rolePipe.transform(role) })
    );
  }

  private refresh(): void {
    this.selection.clear();
    // reload roles after a small delay to ensure that principal was reloaded
    setTimeout(() => {
      this.reload.emit();
      this.outerLoading = false;
    }, 500);
  }

  private parseFacility(facility: EnrichedFacility): Facility {
    return facility.facility;
  }

  private parseResource(resource: RichResource): Resource {
    return {
      beanName: 'Resource',
      id: resource.id,
      description: resource.description,
      createdByUid: resource.createdByUid,
      createdAt: resource.createdAt,
      facilityId: resource.facilityId,
      createdBy: resource.createdBy,
      modifiedAt: resource.modifiedAt,
      modifiedBy: resource.modifiedBy,
      name: resource.name,
      uuid: resource.uuid,
      voId: resource.voId,
      modifiedByUid: resource.modifiedByUid,
    };
  }
}
