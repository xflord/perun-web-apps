import { Component, Inject, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  Group,
  GroupsManagerService,
  MemberCandidate,
  MembersManagerService,
  RegistrarManagerService,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { AddMemberService, FailedCandidate } from '../add-member.service';
import { merge, Observable, of, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { RPCError } from '@perun-web-apps/perun/models';

export interface GroupAddMemberData {
  group: Group;
  manualAddingBlocked?: boolean;
}

@Component({
  selector: 'app-group-add-member-dialog',
  templateUrl: './group-add-member-dialog.component.html',
  styleUrls: ['./group-add-member-dialog.component.scss'],
})
export class GroupAddMemberDialogComponent implements OnInit {
  loading = false;
  addAuth: boolean;
  inviteAuth: boolean;
  showInvite: boolean;
  searcher: Subject<string> = new Subject<string>();
  members: Observable<MemberCandidate[]> = this.searcher.pipe(
    // the cast is for the compiler to recognize correct overload
    switchMap((filter: string) =>
      // emulates loading
      merge(
        of(null as MemberCandidate[]),
        this.voService.getCompleteCandidatesForGroup(this.data.group.id, this.attrNames, filter)
      )
    ),
    startWith(undefined as MemberCandidate[])
  );
  failed: FailedCandidate[] = [];
  selection: SelectionModel<MemberCandidate> = new SelectionModel<MemberCandidate>(true, []);
  attrNames: string[] = [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL].concat(
    this.store.getLoginAttributeNames()
  );
  languages: string[] = this.store.getProperty('supported_languages');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GroupAddMemberData,
    private dialogRef: MatDialogRef<GroupAddMemberDialogComponent>,
    private membersManagerService: MembersManagerService,
    private voService: VosManagerService,
    private registrarManager: RegistrarManagerService,
    private groupService: GroupsManagerService,
    private store: StoreService,
    private guiAuthResolver: GuiAuthResolver,
    private requestService: ApiRequestConfigurationService,
    private addMemberService: AddMemberService,
    private notificator: NotificatorService
  ) {
    this.addMemberService.setDialogRef(this.dialogRef);
    this.addMemberService.setType('group');
  }

  ngOnInit(): void {
    this.inviteAuth = this.guiAuthResolver.isAuthorized(
      'group-sendInvitation_Vo_Group_User_policy',
      [this.data.group]
    );

    this.selection.changed.subscribe((value) => {
      if (value.source.selected.every((selected) => selected.member)) {
        this.addAuth = true;
      } else {
        this.addAuth =
          this.guiAuthResolver.isAuthorized('createMember_Vo_User_List<Group>_policy', [
            this.data.group,
          ]) &&
          this.guiAuthResolver.isAuthorized('createMember_Vo_Candidate_List<Group>_policy', [
            this.data.group,
          ]);
      }
    });

    this.registrarManager
      .invitationFormExists(this.data.group.voId, this.data.group.id)
      .subscribe((res) => {
        this.showInvite = res;
      });
  }

  add(): void {
    this.loading = true;

    this.membersManagerService
      .addMemberCandidates({
        candidates: this.addMemberService.convertToMemberCandidates(this.selection.selected),
        vo: this.data.group.voId,
        group: this.data.group.id,
      })
      .subscribe({
        next: () => {
          this.addMemberService.success('DIALOGS.ADD_MEMBERS.SUCCESS_ADD');
        },
        error: (error: RPCError) => {
          this.loading = false;
          this.notificator.showRPCError(error);
        },
      });
  }

  invite(lang: string): void {
    this.loading = true;

    this.registrarManager
      .inviteMemberCandidates({
        candidates: this.addMemberService.convertToMemberCandidates(this.selection.selected),
        vo: this.data.group.voId,
        lang: lang,
        group: this.data.group.id,
      })
      .subscribe({
        next: () => {
          this.addMemberService.success('DIALOGS.ADD_MEMBERS.SUCCESS_INVITE');
        },
        error: (error: RPCError) => {
          this.loading = false;
          this.notificator.showRPCError(error);
        },
      });
  }

  cancel(result: boolean): void {
    this.dialogRef.close(result);
  }
}
