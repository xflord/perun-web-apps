import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Group,
  GroupAdminRoles,
  GroupsManagerService,
  Member,
  MembersManagerService,
  RoleAssignmentType,
} from '@perun-web-apps/perun/openapi';
import { TABLE_MEMBER_DETAIL_GROUPS } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberGroupDialogComponent } from '../../../../shared/components/dialogs/add-member-group-dialog/add-member-group-dialog.component';
import { RemoveMemberGroupDialogComponent } from '../../../../shared/components/dialogs/remove-member-group-dialog/remove-member-group-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GroupsListComponent } from '@perun-web-apps/perun/components';
import { GroupWithStatus } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-member-groups',
  templateUrl: './member-groups.component.html',
  styleUrls: ['./member-groups.component.scss'],
})
export class MemberGroupsComponent implements OnInit {
  static id = 'MemberGroupsComponent';

  // used for router animation
  @HostBinding('class.router-component') true;
  @ViewChild('toggle', { static: true }) toggle: MatSlideToggle;
  @ViewChild('list') private list: GroupsListComponent;

  groups: Group[] = [];
  member: Member;
  allGroups: Group[];
  loading: boolean;
  filterValue = '';
  filtering = false;
  tableId = TABLE_MEMBER_DETAIL_GROUPS;
  showGroupList = false;
  selection = new SelectionModel<Group>(true, []);
  selectedRoles: GroupAdminRoles[] = [];
  selectedRoleTypes: RoleAssignmentType[] = [];
  addAuth: boolean;
  routeAuth: boolean;
  removeAuth$: Observable<boolean> = this.selection.changed.pipe(
    map((change) =>
      change.source.selected.reduce(
        (acc, grp) =>
          acc && this.authResolver.isAuthorized('removeMember_Member_List<Group>_policy', [grp]),
        true
      )
    ),
    startWith(true)
  );

  constructor(
    private groupsService: GroupsManagerService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private memberService: MembersManagerService,
    private entityService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.member = this.entityService.getEntity();

    this.groupsService.getAllGroups(this.member.voId).subscribe((allGroups) => {
      this.allGroups = allGroups;
      this.addAuth = this.allGroups.reduce(
        (acc, grp) => acc || this.authResolver.isAuthorized('addMember_Group_Member_policy', [grp]),
        false
      );

      this.refreshTable();
      if (localStorage.getItem('preferedValue') === 'list') {
        this.toggle.toggle();
        this.showGroupList = true;
      }

      this.toggle.change.subscribe(() => {
        const value = this.toggle.checked ? 'list' : 'tree';
        localStorage.setItem('preferedValue', value);
        this.refreshTable();
      });
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.groupsService
      .getMemberRichGroupsWithAttributesByNames(
        this.member.id,
        [
          Urns.MEMBER_DEF_GROUP_EXPIRATION,
          Urns.MEMBER_GROUP_STATUS,
          Urns.MEMBER_GROUP_STATUS_INDIRECT,
        ],
        this.selectedRoles,
        this.selectedRoleTypes
      )
      .subscribe({
        next: (groups) => {
          this.selection.clear();
          this.groups = groups;

          if (this.groups.length !== 0) {
            this.routeAuth = this.authResolver.isAuthorized('getGroupById_int_policy', [
              { id: this.member.voId, beanName: 'Vo' },
              this.groups[0],
            ]);
          }

          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  changeExpiration(group: GroupWithStatus): void {
    this.list.changeExpiration(group);
  }

  addGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '850px';
    config.data = {
      memberId: this.member.id,
      membersGroups: new Set<number>(this.groups.map((grp) => grp.id)),
      theme: 'member-theme',
    };

    const dialogRef = this.dialog.open(AddMemberGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  removeGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      memberId: this.member.id,
      groups: this.selection.selected,
      theme: 'member-theme',
    };

    const dialogRef = this.dialog.open(RemoveMemberGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.filtering = filterValue !== '';
  }

  applyRoles(roles: GroupAdminRoles[]): void {
    this.selectedRoles = roles;
    this.refreshTable();
  }

  applyRoleTypes(types: RoleAssignmentType[]): void {
    this.selectedRoleTypes = types;
    this.refreshTable();
  }

  labelToggle(): void {
    this.showGroupList = !this.showGroupList;
    this.refreshTable();
  }
}
