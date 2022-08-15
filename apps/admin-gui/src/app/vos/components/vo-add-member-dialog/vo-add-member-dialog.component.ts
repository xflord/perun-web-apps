import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MemberCandidate,
  MembersManagerService,
  RegistrarManagerService,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService, StoreService } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { getCandidateEmail } from '@perun-web-apps/perun/utils';
import { Urns } from '@perun-web-apps/perun/urns';
import { HttpErrorResponse } from '@angular/common/http';
import { AddMemberService, FailedCandidate } from '../add-member.service';
import { merge, Observable, of, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

export interface VoAddMemberData {
  voId: number;
}

@Component({
  selector: 'app-vo-add-member-dialog',
  templateUrl: './vo-add-member-dialog.component.html',
  styleUrls: ['./vo-add-member-dialog.component.scss'],
})
export class VoAddMemberDialogComponent {
  loading = false;
  searcher: Subject<string> = new Subject<string>();
  members: Observable<MemberCandidate[]> = this.searcher.pipe(
    // the cast is for the compiler to recognize correct overload
    switchMap((filter: string) =>
      // emulates loading
      merge(
        of(null as MemberCandidate[]),
        this.voService.getCompleteCandidatesForVo(this.data.voId, this.attrNames, filter)
      )
    ),
    startWith(undefined as MemberCandidate[])
  );
  failed: FailedCandidate[] = [];
  selection: SelectionModel<MemberCandidate> = new SelectionModel<MemberCandidate>(true, []);
  attrNames: string[] = [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL].concat(
    this.store.getLoginAttributeNames()
  );
  languages: string[] = this.store.get('supported_languages') as string[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: VoAddMemberData,
    private dialogRef: MatDialogRef<VoAddMemberDialogComponent>,
    private membersManagerService: MembersManagerService,
    private voService: VosManagerService,
    private registrarManager: RegistrarManagerService,
    private store: StoreService,
    private requestService: ApiRequestConfigurationService,
    private addMemberService: AddMemberService
  ) {
    this.addMemberService.setDialogRef(this.dialogRef);
    this.addMemberService.setType('vo');
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

    if (candidate.richUser) {
      this.addUser(candidate);
    } else {
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
        vo: this.data.voId,
        candidate: this.addMemberService.createCandidate(candidate.candidate),
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

  private addUser(candidate: MemberCandidate): void {
    this.membersManagerService
      .createMemberForUser({ vo: this.data.voId, user: candidate.richUser.id })
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
      .sendInvitation(getCandidateEmail(candidate.candidate), lang, this.data.voId)
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
      .sendInvitationToExistingUser(candidate.richUser.id, this.data.voId)
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
