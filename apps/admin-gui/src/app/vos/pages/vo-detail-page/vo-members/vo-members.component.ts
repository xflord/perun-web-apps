import { Component, HostBinding, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ApiRequestConfigurationService,
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { RemoveMembersDialogComponent } from '../../../../shared/components/dialogs/remove-members-dialog/remove-members-dialog.component';
import {
  AttributesManagerService,
  RichMember,
  Vo,
  VoMemberStatuses,
} from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { FormControl } from '@angular/forms';
import { TABLE_VO_MEMBERS } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { InviteMemberDialogComponent } from '../../../../shared/components/dialogs/invite-member-dialog/invite-member-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { RPCError } from '@perun-web-apps/perun/models';
import { VoAddMemberDialogComponent } from '../../../components/vo-add-member-dialog/vo-add-member-dialog.component';

@Component({
  selector: 'app-vo-members',
  templateUrl: './vo-members.component.html',
  styleUrls: ['./vo-members.component.scss'],
})
export class VoMembersComponent implements OnInit {
  static id = 'VoMembersComponent';

  @HostBinding('class.router-component') true;
  vo: Vo;
  members: RichMember[] = null;
  selection = new SelectionModel<RichMember>(true, []);
  loading = false;
  attrNames = [
    Urns.MEMBER_DEF_ORGANIZATION,
    Urns.MEMBER_DEF_MAIL,
    Urns.USER_DEF_ORGANIZATION,
    Urns.USER_DEF_PREFERRED_MAIL,
    Urns.MEMBER_DEF_EXPIRATION,
    Urns.MEMBER_LIFECYCLE_ALTERABLE,
  ];
  statuses = new FormControl();
  statusList = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  selectedStatuses: VoMemberStatuses[] = [];
  tableId = TABLE_VO_MEMBERS;
  displayedColumns = ['checkbox', 'id', 'fullName', 'status', 'organization', 'email', 'logins'];
  searchString: string;
  updateTable = false;
  addAuth: boolean;
  removeAuth: boolean;
  inviteAuth: boolean;
  routeAuth: boolean;
  blockManualMemberAdding: boolean;

  constructor(
    private notificator: NotificatorService,
    private dialog: MatDialog,
    private authzService: GuiAuthResolver,
    private storeService: StoreService,
    private attributesManager: AttributesManagerService,
    private apiRequest: ApiRequestConfigurationService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.statuses.setValue(this.selectedStatuses);
    this.attrNames = this.attrNames.concat(this.storeService.getLoginAttributeNames());

    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();

    void this.isManualAddingBlocked(this.vo.id).then(() => (this.loading = false));
  }

  setAuthRights(): void {
    this.addAuth =
      this.authzService.isAuthorized('createMember_Vo_User_List<Group>_policy', [this.vo]) &&
      this.authzService.isAuthorized('createMember_Vo_Candidate_List<Group>_policy', [this.vo]);

    this.removeAuth = this.authzService.isAuthorized('deleteMembers_List<Member>_policy', [
      this.vo,
    ]);

    this.displayedColumns = this.removeAuth
      ? this.displayedColumns
      : ['id', 'fullName', 'status', 'organization', 'email', 'logins'];

    if (this.members !== null && this.members.length !== 0) {
      this.routeAuth = this.authzService.isAuthorized('getMemberById_int_policy', [
        this.vo,
        this.members[0],
      ]);
    }

    this.inviteAuth = this.authzService.isAuthorized(
      'vo-sendInvitation_Vo_Group_String_String_String_policy',
      [this.vo]
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
      voId: this.vo.id,
    };

    const dialogRef = this.dialog.open(VoAddMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe((wereMembersAdded) => {
      if (wereMembersAdded) {
        this.updateTable = !this.updateTable;
        this.selection.clear();
      }
    });
  }

  onRemoveMembers(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      members: this.selection.selected,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(RemoveMembersDialogComponent, config);

    dialogRef.afterClosed().subscribe((wereMembersDeleted) => {
      if (wereMembersDeleted) {
        this.updateTable = !this.updateTable;
        this.selection.clear();
      }
    });
  }

  onInviteMember(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = { voId: this.vo.id, theme: 'vo-theme' };

    this.dialog.open(InviteMemberDialogComponent, config);
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

  isManualAddingBlocked(voId: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.apiRequest.dontHandleErrorForNext();
      this.attributesManager
        .getVoAttributeByName(voId, 'urn:perun:vo:attribute-def:def:blockManualMemberAdding')
        .subscribe(
          (attrValue) => {
            this.blockManualMemberAdding = attrValue.value !== null;
            resolve();
          },
          (error: HttpErrorResponse) => {
            const e = error.error as RPCError;
            if (e.name !== 'PrivilegeException') {
              this.notificator.showError(e.name);
            }
            resolve();
          }
        );
    });
  }

  changeStatuses(): void {
    this.selection.clear();
    this.selectedStatuses = this.statuses.value as VoMemberStatuses[];
  }

  refreshTable(): void {
    this.selection.clear();
    this.updateTable = !this.updateTable;
  }
}
