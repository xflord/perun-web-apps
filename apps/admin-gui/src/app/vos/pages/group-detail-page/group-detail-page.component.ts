import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { fadeIn } from '@perun-web-apps/perun/animations';
import {
  Group,
  GroupsManagerService,
  RichGroup,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  addRecentlyVisited,
  addRecentlyVisitedObject,
  getDefaultDialogConfig,
  isGroupSynchronized,
} from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions,
  GroupSyncDetailDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import { DeleteGroupDialogComponent } from '../../../shared/components/dialogs/delete-group-dialog/delete-group-dialog.component';
import { ReloadEntityDetailService } from '../../../core/services/common/reload-entity-detail.service';
import { destroyDetailMixin } from '../../../shared/destroy-entity-detail';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { QueryParamsRouterService } from '../../../shared/query-params-router.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-group-detail-page',
  templateUrl: './group-detail-page.component.html',
  styleUrls: ['./group-detail-page.component.scss'],
  animations: [fadeIn],
})
export class GroupDetailPageComponent extends destroyDetailMixin() implements OnInit {
  vo: Vo;
  group: RichGroup;
  parentGroup: Group;
  editAuth = false;
  deleteAuth = false;
  loading = false;
  syncAuth = false;
  syncEnabled = false;
  attrNames = [
    Urns.GROUP_SYNC_ENABLED,
    Urns.GROUP_LAST_SYNC_STATE,
    Urns.GROUP_LAST_SYNC_TIMESTAMP,
    Urns.GROUP_STRUCTURE_SYNC_ENABLED,
    Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
    Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP,
  ];

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    public route: ActivatedRoute,
    private sideMenuItemService: SideMenuItemService,
    private groupService: GroupsManagerService,
    private dialog: MatDialog,
    private guiAuthResolver: GuiAuthResolver,
    private router: Router,
    private entityStorageService: EntityStorageService,
    private reloadEntityDetail: ReloadEntityDetailService,
    private queryParamsRouter: QueryParamsRouterService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.reloadEntityDetail.entityDetailChange.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.reloadData();
    });
    this.reloadData();
  }

  onSyncDetail(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      groupId: this.group.id,
      theme: 'group-theme',
    };
    this.dialog.open(GroupSyncDetailDialogComponent, config);
  }

  editGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'group-theme',
      group: this.group,
      dialogType: EditFacilityResourceGroupVoDialogOptions.GROUP,
    };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.groupService.getGroupById(this.group.id).subscribe((group) => {
          this.group = group;
          this.setMenuItems();
        });
      }
    });
  }

  reloadData(): void {
    this.loading = true;
    this.route.params
      .pipe(
        // Get Group id from url
        map((params) => Number(params['groupId'])),
        // Get Group
        switchMap((groupId) => this.groupService.getGroupById(groupId)),
        // Get additional entities (Vo, parent Group if exists, RichGroup if authorized)
        switchMap((group) => {
          this.group = group;
          const richGroupAuth = this.guiAuthResolver.isAuthorized(
            'getRichGroupByIdWithAttributesByNames_int_List<String>_policy',
            [this.group],
          );

          return forkJoin({
            vo: this.voService.getVoById(group.voId),
            parentGroup: group.parentGroupId
              ? this.groupService.getGroupById(group.parentGroupId)
              : of(null),
            richGroup: richGroupAuth
              ? this.groupService.getRichGroupByIdWithAttributesByNames(group.id, this.attrNames)
              : of(group),
          });
        }),
      )
      .subscribe({
        next: (additionalEntities) => {
          this.vo = additionalEntities.vo;
          this.parentGroup = additionalEntities.parentGroup;
          this.group = additionalEntities.richGroup;

          this.entityStorageService.setEntity(this.group);
          addRecentlyVisited('groups', this.group);
          addRecentlyVisitedObject(this.group, this.vo.name);

          this.syncEnabled = isGroupSynchronized(this.group);
          this.setAuth();
          this.setMenuItems();
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  setMenuItems(): void {
    const voSideMenuItem = this.sideMenuItemService.parseVo(this.vo);
    const groupSideMenuItem = this.sideMenuItemService.parseGroup(this.group);

    this.sideMenuService.setAccessMenuItems([voSideMenuItem, groupSideMenuItem]);
  }

  deleteGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'group-theme',
      groups: [this.group],
    };
    const dialogRef = this.dialog.open(DeleteGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.queryParamsRouter.navigate(['../'], this.route);
      }
    });
  }

  private setAuth(): void {
    this.syncAuth = this.guiAuthResolver.isAuthorized('forceGroupSynchronization_Group_policy', [
      this.group,
    ]);
    this.editAuth = this.guiAuthResolver.isAuthorized('updateGroup_Group_policy', [this.group]);
    this.deleteAuth = this.guiAuthResolver.isAuthorized('deleteGroup_Group_boolean_policy', [
      this.group,
    ]);
  }
}
