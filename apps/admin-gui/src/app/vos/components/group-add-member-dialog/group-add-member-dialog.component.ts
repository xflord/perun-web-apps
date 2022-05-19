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
  StoreService,
} from '@perun-web-apps/perun/services';
import { getCandidateEmail } from '@perun-web-apps/perun/utils';
import { HttpErrorResponse } from '@angular/common/http';
import { AddMemberService, FailedCandidate } from '../add-member.service';
import { merge, Observable, of, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

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
  attrNames: string[] = [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL];
  languages: string[] = this.store.get('supported_languages') as string[];

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
    private addMemberService: AddMemberService
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
  }

  add(): void {
    this.loading = true;
    if (this.selection.selected.length === 0) {
      if (this.failed.length !== 0) {
        this.loading = false;
      } else {
        this.addMemberService.success('DIALOGS.ADD_MEMBERS.SUCCESS_ADD');
      }
      return;
    }

    this.requestService.dontHandleErrorForNext();
    const candidate = this.selection.selected.pop();

    if (candidate.member) {
      this.addMember(candidate);
    } else if (candidate.richUser) {
      this.addUser(candidate);
    } else if (candidate.candidate) {
      this.addCandidate(candidate);
    }
  }

  invite(lang: string): void {
    this.loading = true;
    if (this.selection.selected.length === 0) {
      if (this.failed.length !== 0) {
        this.loading = false;
      } else {
        this.addMemberService.success('DIALOGS.ADD_MEMBERS.SUCCESS_INVITE');
      }
      return;
    }

    this.requestService.dontHandleErrorForNext();
    const candidate = this.selection.selected.pop();

    if (candidate.richUser) {
      this.inviteUser(candidate, lang);
    } else {
      this.inviteCandidate(candidate, lang);
    }
  }

  cancel(result: boolean): void {
    this.dialogRef.close(result);
  }

  private addCandidate(candidate: MemberCandidate): void {
    this.membersManagerService
      .createMemberForCandidate({
        vo: this.data.group.voId,
        candidate: this.addMemberService.createCandidate(candidate.candidate),
        groups: [this.addMemberService.getFormattedGroup(this.data.group)],
      })
      .subscribe(
        (member) => {
          this.membersManagerService.validateMemberAsync(member.id).subscribe();
          this.add();
        },
        (error: HttpErrorResponse) => {
          this.failed.push(this.addMemberService.getCandidateWithError(candidate, error));
          this.add();
        }
      );
  }

  private addMember(candidate: MemberCandidate): void {
    this.groupService.addMembers(this.data.group.id, [candidate.member.id]).subscribe(
      () => {
        this.add();
      },
      (error: HttpErrorResponse) => {
        this.failed.push(this.addMemberService.getCandidateWithError(candidate, error));
        this.add();
      }
    );
  }

  private addUser(candidate: MemberCandidate): void {
    this.membersManagerService
      .createMemberForUser({
        vo: this.data.group.voId,
        user: candidate.richUser.id,
        groups: [this.addMemberService.getFormattedGroup(this.data.group)],
      })
      .subscribe(
        (member) => {
          this.membersManagerService.validateMemberAsync(member.id).subscribe();
          this.add();
        },
        (error: HttpErrorResponse) => {
          this.failed.push(this.addMemberService.getCandidateWithError(candidate, error));
          this.add();
        }
      );
  }

  private inviteCandidate(candidate: MemberCandidate, lang: string): void {
    this.registrarManager
      .sendInvitationForGroup(
        getCandidateEmail(candidate.candidate),
        lang,
        this.data.group.voId,
        this.data.group.id
      )
      .subscribe(
        () => {
          this.invite(lang);
        },
        (error: HttpErrorResponse) => {
          this.failed.push(this.addMemberService.getCandidateWithError(candidate, error));
          this.invite(lang);
        }
      );
  }

  private inviteUser(candidate: MemberCandidate, lang: string): void {
    this.registrarManager
      .sendInvitationGroupToExistingUser(
        candidate.richUser.id,
        this.data.group.voId,
        this.data.group.id
      )
      .subscribe(
        () => {
          this.invite(lang);
        },
        (error: HttpErrorResponse) => {
          this.failed.push(this.addMemberService.getCandidateWithError(candidate, error));
          this.invite(lang);
        }
      );
  }
}
