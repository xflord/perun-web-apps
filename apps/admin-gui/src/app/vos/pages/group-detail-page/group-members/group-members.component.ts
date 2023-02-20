import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ApiRequestConfigurationService,
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { MatDialog } from '@angular/material/dialog';
import { RemoveMembersDialogComponent } from '../../../../shared/components/dialogs/remove-members-dialog/remove-members-dialog.component';
import {
  AttributesManagerService,
  GroupsManagerService,
  MemberGroupStatus,
  RichGroup,
  RichMember,
  VoMemberStatuses,
} from '@perun-web-apps/perun/openapi';
import { TABLE_GROUP_MEMBERS } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig, isGroupSynchronized } from '@perun-web-apps/perun/utils';
import { InviteMemberDialogComponent } from '../../../../shared/components/dialogs/invite-member-dialog/invite-member-dialog.component';
import { UntypedFormControl } from '@angular/forms';
import { RPCError } from '@perun-web-apps/perun/models';
import { GroupAddMemberDialogComponent } from '../../../components/group-add-member-dialog/group-add-member-dialog.component';
import { BulkInviteMembersDialogComponent } from '../../../../shared/components/dialogs/bulk-invite-members-dialog/bulk-invite-members-dialog.component';
import { CopyMembersDialogComponent } from '../../../../shared/components/dialogs/copy-members-dialog/copy-members-dialog-component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss'],
})
export class GroupMembersComponent implements OnInit {
  static id = 'GroupMembersComponent';

  // used for router animation
  @HostBinding('class.router-component') true;
  group: RichGroup;
  selection: SelectionModel<RichMember>;
  synchEnabled = false;
  searchString: string;
  updateTable = false;
  loading$: Observable<boolean>;
  tableId = TABLE_GROUP_MEMBERS;
  memberAttrNames = [
    Urns.MEMBER_DEF_ORGANIZATION,
    Urns.MEMBER_DEF_MAIL,
    Urns.USER_DEF_ORGANIZATION,
    Urns.USER_DEF_PREFERRED_MAIL,
    Urns.MEMBER_DEF_EXPIRATION,
    Urns.MEMBER_DEF_GROUP_EXPIRATION,
    Urns.MEMBER_LIFECYCLE_ALTERABLE,
  ];
  addAuth: boolean;
  removeAuth: boolean;
  inviteAuth: boolean;
  copyAuth: boolean;
  copyDisabled = false;
  blockManualMemberAdding: boolean;
  displayedColumns = [
    'checkbox',
    'id',
    'type',
    'fullName',
    'status',
    'groupStatus',
    'organization',
    'email',
    'logins',
  ];
  statuses = new UntypedFormControl();
  statusList = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  selectedStatuses: VoMemberStatuses[] = ['VALID', 'INVALID'];
  groupStatuses = new UntypedFormControl();
  groupStatusList = ['VALID', 'EXPIRED'];
  selectedGroupStatuses: MemberGroupStatus[] = ['VALID'];
  private groupAttrNames = [
    Urns.GROUP_SYNC_ENABLED,
    Urns.GROUP_LAST_SYNC_STATE,
    Urns.GROUP_LAST_SYNC_TIMESTAMP,
    Urns.GROUP_STRUCTURE_SYNC_ENABLED,
    Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
    Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP,
    Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING,
  ];

  constructor(
    private groupService: GroupsManagerService,
    private dialog: MatDialog,
    private guiAuthResolver: GuiAuthResolver,
    private storeService: StoreService,
    private attributesManager: AttributesManagerService,
    private apiRequest: ApiRequestConfigurationService,
    private notificator: NotificatorService,
    private entityStorageService: EntityStorageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading$ = of(true);
    this.selection = new SelectionModel<RichMember>(true, []);
    this.statuses.setValue(this.selectedStatuses);
    this.groupStatuses.setValue(this.selectedGroupStatuses);
    this.memberAttrNames = this.memberAttrNames.concat(this.storeService.getLoginAttributeNames());
    this.group = this.entityStorageService.getEntity();
    this.setAuthRights();
    void this.isManualAddingBlocked(this.group.voId).then(() => this.loadPage(this.group.id));
    this.isCopyMembersDisabled();
  }

  loadPage(groupId: number): void {
    this.groupService
      .getRichGroupByIdWithAttributesByNames(groupId, this.groupAttrNames)
      .subscribe((group) => {
        this.group = group;
        this.synchEnabled = isGroupSynchronized(this.group);
      });
  }

  setAuthRights(): void {
    this.addAuth = this.guiAuthResolver.isAuthorized('addMembers_Group_List<Member>_policy', [
      this.group,
    ]);
    this.removeAuth = this.guiAuthResolver.isAuthorized('removeMembers_Group_List<Member>_policy', [
      this.group,
    ]);
    this.displayedColumns = this.removeAuth
      ? this.displayedColumns
      : ['id', 'type', 'fullName', 'status', 'groupStatus', 'organization', 'email', 'logins'];
    this.inviteAuth = this.guiAuthResolver.isAuthorized(
      'group-sendInvitation_Vo_Group_String_String_String_policy',
      [this.group]
    );
    this.copyAuth = this.guiAuthResolver.isAuthorized(
      'source-copyMembers_Group_List<Group>_List<Member>_boolean_policy',
      [this.group]
    );
  }

  onSearchByString(filter: string): void {
    this.searchString = filter;
    this.selection.clear();
  }

  onAddMember(): void {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data = {
      group: this.group,
      manualAddingBlocked: this.blockManualMemberAdding,
    };

    const dialogRef = this.dialog.open(GroupAddMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe((wereMembersAdded) => {
      if (wereMembersAdded) {
        this.selection.clear();
        this.updateTable = !this.updateTable;
        this.isCopyMembersDisabled();
      }
    });
  }

  onRemoveMembers(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      groupId: this.group.id,
      members: this.selection.selected,
      theme: 'group-theme',
    };

    const dialogRef = this.dialog.open(RemoveMembersDialogComponent, config);

    dialogRef.afterClosed().subscribe((wereMembersDeleted) => {
      if (wereMembersDeleted) {
        this.selection.clear();
        this.updateTable = !this.updateTable;
        this.isCopyMembersDisabled();
      }
    });
  }

  onInviteMember(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      voId: this.group.voId,
      groupId: this.group.id,
      theme: 'group-theme',
    };

    this.dialog.open(InviteMemberDialogComponent, config);
  }

  onBulkInvite(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = { voId: this.group.voId, groupId: this.group.id, theme: 'group-theme' };

    this.dialog.open(BulkInviteMembersDialogComponent, config);
  }

  onCopyMembers(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      voId: this.group.voId,
      groupId: this.group.id,
      theme: 'group-theme',
      members: this.selection.selected,
    };

    const dialogRef = this.dialog.open(CopyMembersDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.selection.clear();
      }
    });
  }

  displaySelectedStatuses(): string {
    if (this.selectedStatuses.length === this.statusList.length) {
      return 'ALL';
    }
    const statuses: string[] = this.statuses.value as string[];
    if (statuses) {
      return `${statuses[0]}  ${
        statuses.length > 1
          ? '(+' +
            (statuses.length - 1).toString() +
            ' ' +
            (statuses.length === 2 ? 'other)' : 'others)')
          : ''
      }`;
    }
    return '';
  }

  displaySelectedGroupStatuses(): string {
    if (this.selectedGroupStatuses.length === this.groupStatusList.length) {
      return 'ALL';
    } else {
      return `${(this.groupStatuses.value as string[])[0]}`;
    }
  }

  isManualAddingBlocked(voId: number): Promise<void> {
    return new Promise((resolve) => {
      this.apiRequest.dontHandleErrorForNext();
      this.attributesManager
        .getVoAttributeByName(voId, 'urn:perun:vo:attribute-def:def:blockManualMemberAdding')
        .subscribe({
          next: (attrValue) => {
            this.blockManualMemberAdding = attrValue.value !== null;
            resolve();
          },
          error: (error: RPCError) => {
            if (error.name !== 'PrivilegeException') {
              this.notificator.showError(error.name);
            }
            resolve();
          },
        });
    });
  }

  isCopyMembersDisabled(): void {
    this.copyDisabled = true;
    this.groupService.getGroupDirectMembersCount(this.group.id).subscribe({
      next: (count) => {
        this.copyDisabled = count === 0;
      },
      error: () => {
        this.copyDisabled = true;
      },
    });
  }

  changeVoStatuses(): void {
    this.selection.clear();
    this.selectedStatuses = this.statuses.value as VoMemberStatuses[];
    this.cd.detectChanges();
  }

  changeGroupStatuses(): void {
    this.selection.clear();
    this.selectedGroupStatuses = this.groupStatuses.value as MemberGroupStatus[];
    this.cd.detectChanges();
  }

  refreshTable(): void {
    this.selection.clear();
    this.updateTable = !this.updateTable;
    this.cd.detectChanges();
    this.isCopyMembersDisabled();
  }
}
