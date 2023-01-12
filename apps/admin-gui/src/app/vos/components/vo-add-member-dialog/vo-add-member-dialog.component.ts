import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MemberCandidate,
  MembersManagerService,
  RegistrarManagerService,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  ApiRequestConfigurationService,
  NotificatorService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { AddMemberService, FailedCandidate } from '../add-member.service';
import { merge, Observable, of, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { RPCError } from '@perun-web-apps/perun/models';

export interface VoAddMemberData {
  voId: number;
}

@Component({
  selector: 'app-vo-add-member-dialog',
  templateUrl: './vo-add-member-dialog.component.html',
  styleUrls: ['./vo-add-member-dialog.component.scss'],
})
export class VoAddMemberDialogComponent implements OnInit {
  loading = false;
  showInvite = false;
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
  languages: string[] = this.store.getProperty('supported_languages');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: VoAddMemberData,
    private dialogRef: MatDialogRef<VoAddMemberDialogComponent>,
    private membersManagerService: MembersManagerService,
    private voService: VosManagerService,
    private registrarManager: RegistrarManagerService,
    private store: StoreService,
    private requestService: ApiRequestConfigurationService,
    private addMemberService: AddMemberService,
    private notificator: NotificatorService
  ) {
    this.addMemberService.setDialogRef(this.dialogRef);
    this.addMemberService.setType('vo');
  }

  ngOnInit(): void {
    this.registrarManager.invitationFormExists(this.data.voId).subscribe((res) => {
      this.showInvite = res;
    });
  }

  add(): void {
    this.loading = true;

    this.membersManagerService
      .addMemberCandidates({
        candidates: this.addMemberService.convertToMemberCandidates(this.selection.selected),
        vo: this.data.voId,
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
        vo: this.data.voId,
        lang: lang,
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
