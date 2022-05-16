import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GuiAuthResolver, NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import {
  Candidate,
  Group,
  GroupsManagerService,
  MemberCandidate,
  MembersManagerService,
  RegistrarManagerService,
  UserExtSource,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { getCandidateEmail } from '@perun-web-apps/perun/utils';
import { TABLE_ADD_MEMBER_CANDIDATES_DIALOG } from '@perun-web-apps/config/table-config';
import { MembersCandidatesListComponent } from '../../members-candidates-list/members-candidates-list.component';
import { FormControl, Validators } from '@angular/forms';

export interface AddMemberDialogData {
  voId?: number;
  entityId: number;
  group?: Group;
  manualAddingBlocked?: boolean;
  theme: string;
  type: 'vo' | 'group';
}

interface SimplifiedCandidate {
  userExtSource: UserExtSource;
  additionalUserExtSources: UserExtSource[];
  attributes: { [key: string]: string };
  firstName: string;
  lastName: string;
  middleName: string;
  titleBefore: string;
  titleAfter: string;
  id: number;
}

@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent implements OnInit {
  @ViewChild('list', {})
  list: MembersCandidatesListComponent;

  languages = ['en'];

  title: string;

  selection = new SelectionModel<MemberCandidate>(true, []);
  loading: boolean;
  processing: boolean;
  members: MemberCandidate[] = [];
  failed: MemberCandidate[] = [];
  addSuccess = true;
  inviteSuccess = true;

  firstSearchDone = false;

  theme: string;
  tableId = TABLE_ADD_MEMBER_CANDIDATES_DIALOG;

  inviteAuth = false;
  searchCtrl: FormControl;

  manualAddingBlocked = false;

  constructor(
    private dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddMemberDialogData,
    private membersManagerService: MembersManagerService,
    private groupService: GroupsManagerService,
    private voService: VosManagerService,
    private registrarManager: RegistrarManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    protected route: ActivatedRoute,
    protected router: Router,
    private guiAuthResolver: GuiAuthResolver,
    private store: StoreService
  ) {
    translate.get('DIALOGS.ADD_MEMBERS.TITLE').subscribe((value: string) => (this.title = value));
  }

  //perun is expecting precisely this set of values that will be in the object Candidate
  private static createCandidate(candidate: Candidate): SimplifiedCandidate {
    return {
      userExtSource: candidate.userExtSource,
      additionalUserExtSources: candidate.additionalUserExtSources,
      attributes: candidate.attributes,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      middleName: candidate.middleName,
      titleBefore: candidate.titleBefore,
      titleAfter: candidate.titleAfter,
      id: candidate.id,
    };
  }

  ngOnInit(): void {
    this.languages = this.store.get('supported_languages') as string[];
    this.theme = this.data.theme;
    this.manualAddingBlocked = this.data.manualAddingBlocked;
    if (this.data.type === 'group') {
      this.inviteAuth = this.guiAuthResolver.isAuthorized(
        'group-sendInvitation_Vo_Group_User_policy',
        [this.data.group]
      );
    }
    this.searchCtrl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onAdd(): void {
    this.processing = true;
    // TODO Adds only one member at the time. In the future there would be need to add more
    if (this.selection.selected.length === 0) {
      this.onAddSuccess();
      return;
    }
    const selectedMemberCandidate = this.selection.selected.pop();

    if (this.data.type === 'vo') {
      if (selectedMemberCandidate.richUser) {
        this.addUserToVo(selectedMemberCandidate);
      } else {
        this.addCandidateToVo(selectedMemberCandidate);
      }
    } else if (this.data.type === 'group') {
      if (selectedMemberCandidate.member) {
        this.addMemberToGroup(selectedMemberCandidate);
      } else if (selectedMemberCandidate.richUser) {
        this.addUserToGroup(selectedMemberCandidate);
      } else if (selectedMemberCandidate.candidate) {
        this.addCandidateToGroup(selectedMemberCandidate);
      }
    }
  }

  onInvite(lang: string): void {
    this.processing = true;
    // TODO Was not tested properly. Need to be tested on devel.
    if (this.selection.selected.length === 0) {
      this.onInviteSuccess();
      return;
    }
    const selectedUser = this.selection.selected.pop();
    if (selectedUser.richUser) {
      if (this.data.type === 'vo') {
        this.registrarManager
          .sendInvitationToExistingUser(selectedUser.richUser.id, this.data.entityId)
          .subscribe(
            () => {
              this.onInvite(lang);
            },
            () => this.onInviteError(selectedUser)
          );
      } else if (this.data.type === 'group') {
        this.registrarManager
          .sendInvitationGroupToExistingUser(
            selectedUser.richUser.id,
            this.data.voId,
            this.data.group.id
          )
          .subscribe(
            () => {
              this.onInvite(lang);
            },
            () => this.onInviteError(selectedUser)
          );
      }
    } else {
      if (this.data.type === 'vo') {
        this.registrarManager
          .sendInvitation(getCandidateEmail(selectedUser.candidate), lang, this.data.voId)
          .subscribe(
            () => {
              this.onInvite(lang);
            },
            () => this.onInviteError(selectedUser)
          );
      } else if (this.data.type === 'group') {
        this.registrarManager
          .sendInvitationForGroup(
            getCandidateEmail(selectedUser.candidate),
            lang,
            this.data.voId,
            this.data.group.id
          )
          .subscribe(
            () => {
              this.onInvite(lang);
            },
            () => this.onInviteError(selectedUser)
          );
      }
    }
  }

  filterMembers(richUsers: number[], candidates: number[], member: MemberCandidate): boolean {
    if (member.candidate) {
      return candidates.includes(member.candidate.id);
    }
    return richUsers.includes(member.richUser.id);
  }

  onSearchByString(): void {
    if (this.searchCtrl.invalid) {
      this.searchCtrl.markAllAsTouched();
      return;
    }
    this.loading = true;

    // TODO properly test it on devel when possible.
    if (this.data.type === 'vo') {
      this.voService
        .getCompleteCandidatesForVo(
          this.data.entityId,
          [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL],
          this.searchCtrl.value as string
        )
        .subscribe(
          (members) => {
            this.processMemberCandidateList(members);
          },
          () => (this.loading = false)
        );
    } else {
      this.voService
        .getCompleteCandidatesForGroup(
          this.data.entityId,
          [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL],
          this.searchCtrl.value as string
        )
        .subscribe(
          (members) => {
            this.processMemberCandidateList(members);
          },
          () => (this.loading = false)
        );
    }
  }

  private processMemberCandidateList(members: Array<MemberCandidate>): void {
    const richUsers: number[] = [];
    const candidates: number[] = [];
    for (const selectedMember of this.selection.selected) {
      if (selectedMember.candidate) {
        candidates.push(selectedMember.candidate.id);
      } else {
        richUsers.push(selectedMember.richUser.id);
      }
    }
    this.members = [
      ...members.filter((el) => !this.filterMembers(richUsers, candidates, el)),
      ...this.selection.selected,
    ];
    this.loading = false;
    this.firstSearchDone = true;
  }

  private addUserToVo(selectedMemberCandidate: MemberCandidate): void {
    this.membersManagerService
      .createMemberForUser({ vo: this.data.entityId, user: selectedMemberCandidate.richUser.id })
      .subscribe(
        (member) => {
          this.membersManagerService.validateMemberAsync(member.id).subscribe(
            () => {
              // do nothing.
            },
            () => this.onCancel()
          );
          this.onAdd();
        },
        () => this.onAddError(selectedMemberCandidate)
      );
  }

  private addCandidateToVo(selectedMemberCandidate: MemberCandidate): void {
    this.membersManagerService
      .createMemberForCandidate({
        vo: this.data.entityId,
        candidate: AddMemberDialogComponent.createCandidate(
          selectedMemberCandidate.candidate
        ) as Candidate,
      })
      .subscribe(
        (member) => {
          this.membersManagerService.validateMemberAsync(member.id).subscribe(
            () => {
              // do nothing.
            },
            () => this.onCancel()
          );
          this.onAdd();
        },
        () => this.onAddError(selectedMemberCandidate)
      );
  }

  private addUserToGroup(selectedMemberCandidate: MemberCandidate): void {
    const group = {
      id: this.data.group.id,
      beanName: this.data.group.beanName,
      name: this.data.group.name,
      voId: this.data.group.voId,
    };
    this.membersManagerService
      .createMemberForUser({
        vo: this.data.voId,
        user: selectedMemberCandidate.richUser.id,
        groups: [group],
      })
      .subscribe(
        (member) => {
          this.membersManagerService.validateMemberAsync(member.id).subscribe(
            () => {
              // do nothing.
            },
            () => this.onCancel()
          );
          this.onAdd();
        },
        () => this.onAddError(selectedMemberCandidate)
      );
  }

  private addMemberToGroup(selectedMemberCandidate: MemberCandidate): void {
    this.groupService.addMembers(this.data.entityId, [selectedMemberCandidate.member.id]).subscribe(
      () => {
        this.onAdd();
      },
      () => this.onAddError(selectedMemberCandidate)
    );
  }

  private addCandidateToGroup(selectedMemberCandidate: MemberCandidate): void {
    const group = {
      id: this.data.group.id,
      beanName: this.data.group.beanName,
      name: this.data.group.name,
      voId: this.data.group.voId,
    };
    this.membersManagerService
      .createMemberForCandidate({
        vo: this.data.voId,
        candidate: AddMemberDialogComponent.createCandidate(
          selectedMemberCandidate.candidate
        ) as Candidate,
        groups: [group],
      })
      .subscribe(
        (member) => {
          this.onAddSuccess();
          this.membersManagerService.validateMemberAsync(member.id).subscribe(
            () => {
              // do nothing.
            },
            () => this.onCancel()
          );
          this.onAdd();
        },
        () => this.onAddError(selectedMemberCandidate)
      );
  }

  private onAddSuccess(): void {
    this.translate.get('DIALOGS.ADD_MEMBERS.SUCCESS').subscribe((msg) => {
      this.notificator.showSuccess(msg as string);
      this.dialogRef.close(true);
    });
  }

  private onInviteError(failed: MemberCandidate): void {
    this.translate.get('DIALOGS.ADD_MEMBERS.ERROR_INVITE').subscribe((msg) => {
      this.notificator.showError(
        msg as string,
        null,
        (this.translate.instant('DIALOGS.ADD_MEMBERS.ERROR_INVITE_DESC') as string) +
          this.convertMemberCandidateToString(failed)
      );
      this.dialogRef.close(false);
    });
    this.selection.clear();
    this.failed = [];
    this.inviteSuccess = true;
    this.processing = false;
  }

  private convertMemberCandidateToString(member: MemberCandidate): string {
    return member.richUser
      ? `[id: ${member.richUser.id}, ${member.richUser.firstName}, ${member.richUser.lastName}]`
      : `[id: ${member.candidate.id}, ${member.candidate.firstName}, ${member.candidate.lastName}]`;
  }

  private onAddError(failed: MemberCandidate): void {
    this.translate.get('DIALOGS.ADD_MEMBERS.ERROR_ADD').subscribe((msg) => {
      this.notificator.showError(
        msg as string,
        null,
        (this.translate.instant('DIALOGS.ADD_MEMBERS.ERROR_ADD_DESC') as string) +
          this.convertMemberCandidateToString(failed)
      );
      this.dialogRef.close(this.selection.selected !== this.failed);
    });
    this.selection.clear();
    this.failed = [];
    this.addSuccess = true;
    this.processing = false;
  }

  private onInviteSuccess(): void {
    this.translate.get('DIALOGS.ADD_MEMBERS.SUCCESS_INVITE').subscribe((msg) => {
      this.notificator.showSuccess(msg as string);
      this.dialogRef.close(true);
    });
  }
}
