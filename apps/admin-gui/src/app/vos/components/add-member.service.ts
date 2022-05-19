import { Injectable } from '@angular/core';
import { Candidate, Group, MemberCandidate } from '@perun-web-apps/perun/openapi';
import { MatDialogRef } from '@angular/material/dialog';
import { GroupAddMemberDialogComponent } from './group-add-member-dialog/group-add-member-dialog.component';
import { VoAddMemberDialogComponent } from './vo-add-member-dialog/vo-add-member-dialog.component';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RPCError } from '@perun-web-apps/perun/models';

export interface FailedCandidate {
  candidate: MemberCandidate;
  errorName: string;
  errorMsg: string;
}

type Ref = MatDialogRef<VoAddMemberDialogComponent | GroupAddMemberDialogComponent>;

@Injectable({
  providedIn: 'root',
})
export class AddMemberService {
  private entityType: 'vo' | 'group';
  private dialogRef: Ref;
  constructor(private notificator: NotificatorService, private translate: TranslateService) {}

  setDialogRef(ref: Ref): void {
    this.dialogRef = ref;
  }

  setType(type: 'vo' | 'group'): void {
    this.entityType = type;
  }

  getType(): 'vo' | 'group' {
    return this.entityType;
  }

  // perun is expecting precisely this set of values that will be in the object Candidate
  createCandidate(candidate: Candidate): Candidate {
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
    } as Candidate;
  }

  getFormattedGroup(group: Group): Group {
    return {
      id: group.id,
      beanName: group.beanName,
      name: group.name,
      voId: group.voId,
    };
  }

  success(notification: string): void {
    this.notificator.showSuccess(this.translate.instant(notification) as string);
    this.dialogRef.close(true);
  }

  getCandidateWithError(candidate: MemberCandidate, error: HttpErrorResponse): FailedCandidate {
    const e: RPCError = error.error as RPCError;
    const msg: string = e.message.split(':').splice(1).join();
    return { candidate: candidate, errorName: e.name, errorMsg: msg };
  }
}
