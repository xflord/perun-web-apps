import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
import { BehaviorSubject, iif, mergeMap, Observable, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-perun-web-apps-roles-page',
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.scss'],
  providers: [DisplayedRolePipe, ManageableEntitiesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPageComponent implements OnInit {
  @Input() outerLoading: boolean;
  @Input() showDescription: boolean;
  @Input() entityId: number;
  @Input() entityType: 'SELF' | 'USER' | 'GROUP';
  @Output() reload = new EventEmitter<void>();
  @Output() startLoading = new EventEmitter<void>();

  selection = new SelectionModel<PerunBean>(true, []);
  selectedFacilities = new SelectionModel<EnrichedFacility>(true, []);
  loading: boolean;
  assignableRules: RoleManagementRules[] = [];
  allRules: RoleManagementRules[] = [];
  disableRemove = false;

  selectedRole = new BehaviorSubject<RoleManagementRules>(null);

  groups: Observable<Group[]> = this.selectedRole.pipe(
    switchMap((role) => {
      this.loading = true;
      const ids = this.roles.get(role.roleName).get('Group');
      if (ids?.length) {
        return this.groupsService.getGroupsByIds(ids);
      } else {
        return of([] as Group[]);
      }
    }),
    tap(() => (this.loading = false)),
    startWith([])
  );

  vos: Observable<Vo[]> = this.selectedRole.pipe(
    switchMap((role) => {
      this.loading = true;
      const ids = this.roles.get(role.roleName).get('Vo');
      if (ids?.length) {
        return this.vosService.getVosByIds(ids);
      } else {
        return of([] as Vo[]);
      }
    }),
    tap(() => (this.loading = false)),
    startWith([])
  );

  facilities: Observable<EnrichedFacility[]> = this.selectedRole.pipe(
    switchMap((role) => {
      this.loading = true;
      const ids = this.roles.get(role.roleName).get('Facility');
      if (ids?.length) {
        return this.facilitiesService.getFacilitiesByIds(ids);
      } else {
        return of([] as Facility[]);
      }
    }),
    map((facilities) => facilities.map((f) => ({ facility: f }))),
    tap(() => (this.loading = false)),
    startWith([])
  );

  resources: Observable<RichResource[]> = this.selectedRole.pipe(
    switchMap((role) => {
      this.loading = true;
      const ids = this.roles.get(role.roleName).get('Resource');
      if (ids?.length) {
        return this.resourcesService.getRichResourcesByIds(ids);
      } else {
        return of([] as RichResource[]);
      }
    }),
    tap(() => (this.loading = false)),
    startWith([])
  );

  members: Observable<RichMember[]> = this.selectedRole.pipe(
    switchMap((role) =>
      this.membersService.getRichMembersByIds(this.roles.get(role.roleName).get('Member'))
    ),
    tap(() => (this.loading = false)),
    startWith([])
  );

  users: Observable<RichUser[]> = this.selectedRole.pipe(
    switchMap((role) =>
      this.usersService.getRichUsersByIds(
        [this.entityId].concat(this.roles.get(role.roleName).get('User'))
      )
    ),
    tap(() => (this.loading = false)),
    startWith([])
  );

  private _roles = new Map<string, Map<string, number[]>>();

  constructor(
    private authzResolverService: AuthzResolverService,
    private usersService: UsersManagerService,
    private vosService: VosManagerService,
    private facilitiesService: FacilitiesManagerService,
    private resourcesService: ResourcesManagerService,
    private groupsService: GroupsManagerService,
    private membersService: MembersManagerService,
    private dialog: MatDialog,
    private notification: NotificatorService,
    private translate: PerunTranslateService,
    private rolePipe: DisplayedRolePipe,
    private guiAuthResolver: GuiAuthResolver,
    private manageableEntities: ManageableEntitiesPipe
  ) {}

  get roles(): Map<string, Map<string, number[]>> {
    return this._roles;
  }

  @Input() set roles(roles: Map<string, Map<string, number[]>>) {
    this._roles = roles;
    // Update assigned rules with each change
    this.allRules = this.guiAuthResolver
      .getAllRules()
      .filter((rule) => this._roles.has(rule.roleName));
  }

  ngOnInit(): void {
    this.assignableRules = this.guiAuthResolver.getAssignableRoleRules(
      this.entityType === 'GROUP' ? 'GROUP' : 'USER'
    );

    this.selection.changed.subscribe((change) => {
      const entities = change.source.selected.map((item) => {
        if ('beanName' in item) return item;
      });
      const manageableNum = this.manageableEntities.transform(
        entities,
        this.selectedRole.getValue()
      ).length;
      this.disableRemove = change.source.selected.length !== manageableNum;
    });

    this.selectedFacilities.changed.subscribe((change) => {
      const entities = change.source.selected.map((item) => {
        if ('facility' in item) return item.facility;
      });
      const manageableNum = this.manageableEntities.transform(
        entities,
        this.selectedRole.getValue()
      ).length;
      this.disableRemove = change.source.selected.length !== manageableNum;
    });
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
          this.startLoading.emit();
          this.refresh();
        }
      },
    });
  }

  openConfirmDialog(role: RoleManagementRules): void {
    const config = getDefaultDialogConfig();
    const displayItems = this.getItems();

    config.width = '550px';
    config.data = {
      theme: this.entityType === 'GROUP' ? 'group-theme' : 'user-theme',
      title: 'ROLES.REMOVE',
      description: this.selectedRole.getValue().primaryObject
        ? this.translate.instant('ROLES.REMOVE_DESC_WITH_OBJECTS', {
            role: this.rolePipe.transform(role),
            count: displayItems.length,
          })
        : this.translate.instant('ROLES.REMOVE_DESC', { role: this.rolePipe.transform(role) }),
      items: displayItems,
      alert: false,
      type: 'remove',
      showAsk: true,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.startLoading.emit();
          if (role.primaryObject) this.removeRoleWithComplementaryObject(role);
          else this.removeRole(role);
        }
      },
    });
  }

  private getItems(): string[] {
    if (!this.selectedRole.getValue().primaryObject) {
      return [];
    }
    if (this.selectedRole.getValue().primaryObject === 'Facility') {
      return this.selectedFacilities.selected.map((ef) => ef.facility.name);
    }
    return this.selection.selected.map((bean) => (bean as Group | RichResource | Vo).name);
  }

  private removeRole(role: RoleManagementRules): void {
    of(this.entityType)
      .pipe(
        mergeMap((type) =>
          iif(
            () => type === 'GROUP',
            this.authzResolverService.unsetRoleForGroup({
              role: role.roleName,
              authorizedGroup: this.entityId,
            }),
            this.authzResolverService.unsetRoleForUser({ role: role.roleName, user: this.entityId })
          )
        )
      )
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

  private removeRoleWithComplementaryObject(role: RoleManagementRules): void {
    let assignedObjects: PerunBean[];
    if (this.selection.selected.length !== 0 && 'beanName' in this.selection.selected[0]) {
      assignedObjects = this.selection.selected;
      if (assignedObjects[0].beanName === 'RichResource') {
        assignedObjects = assignedObjects.map((resource) => this.parseResource(resource));
      }
    } else if (
      this.selectedFacilities.selected.length !== 0 &&
      'facility' in this.selectedFacilities.selected[0]
    ) {
      // Facility list works with Enriched facilities we need just basic facility
      assignedObjects = this.selectedFacilities.selected.map((facility) =>
        this.parseFacility(facility)
      );
    }

    of(this.entityType)
      .pipe(
        mergeMap((type) =>
          iif(
            () => type === 'GROUP',
            this.authzResolverService.unsetRoleWithGroupComplementaryObjects({
              role: role.roleName,
              complementaryObjects: assignedObjects,
              authorizedGroup: this.entityId,
            }),
            this.authzResolverService.unsetRoleWithUserComplementaryObjects({
              role: role.roleName,
              complementaryObjects: assignedObjects,
              user: this.entityId,
            })
          )
        )
      )
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

  private showSuccess(role: RoleManagementRules): void {
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
