import { Component, Inject } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { downloadData, emailRegexString } from '@perun-web-apps/perun/utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '@perun-web-apps/perun/services';
import { InputInvitationsFromCsv, RegistrarManagerService } from '@perun-web-apps/perun/openapi';

export interface BulkInviteMembersDialogData {
  theme: string;
  voId: number;
  groupId: number;
}

interface OutputData {
  email: string;
  status: string;
}

@Component({
  selector: 'app-bulk-invite-members-dialog',
  templateUrl: './bulk-invite-members-dialog.component.html',
  styleUrls: ['./bulk-invite-members-dialog.component.scss'],
})
export class BulkInviteMembersDialogComponent {
  invitedMembers = new FormControl('', [Validators.required, this.userInputValidator()]);
  languages = this.store.getProperty('supported_languages');
  currentLanguage = 'en';
  loading = false;
  state = 'input';
  finishedWithErrors: boolean;
  resultData: { [p: string]: string };

  constructor(
    public dialogRef: MatDialogRef<BulkInviteMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkInviteMembersDialogData,
    private store: StoreService,
    private registrarManager: RegistrarManagerService,
  ) {}

  private static didSomeInviteFail(resultData: { [p: string]: string }): boolean {
    for (const key in resultData) {
      if (resultData[key] !== 'OK') {
        return true;
      }
    }
    return false;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    const listOfMembers = this.invitedMembers.value.split('\n');
    const parsedMembers: string[] = [];
    for (const line of listOfMembers) {
      parsedMembers.push(this.parseMemberLine(line));
    }

    const inputSendInvitationsFromCsv: InputInvitationsFromCsv = {
      invitationData: parsedMembers,
      voId: this.data.voId,
      language: this.currentLanguage,
    };

    if (this.data.groupId !== undefined) {
      inputSendInvitationsFromCsv.groupId = this.data.groupId;
    }

    this.registrarManager.sendInvitationsFromCsv(inputSendInvitationsFromCsv).subscribe({
      next: (resultData) => {
        this.state = 'results';
        this.finishedWithErrors = BulkInviteMembersDialogComponent.didSomeInviteFail(resultData);
        this.resultData = resultData;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  downloadCsv(): void {
    downloadData(this.generateOutputData(this.resultData), 'csv', 'member-invites');
  }

  generateOutputData(data: { [p: string]: string }): OutputData[] {
    const result: OutputData[] = [];

    for (const key in data) {
      result.push({ email: key, status: data[key] });
    }

    return result;
  }

  private parseMemberLine(line: string): string {
    const trimLine = line.trim();
    if (trimLine === '') {
      return '';
    }
    const memberAttributes = trimLine.split(';');

    if (memberAttributes.length > 2 || memberAttributes.length === 0) {
      //check if all attributes are filled
      return 'format';
    }
    if (!memberAttributes[0].trim().match(emailRegexString)) {
      //check if the email is valid email
      return 'email';
    }

    let finalString = '';
    for (const memberAttribute of memberAttributes) {
      finalString += memberAttribute.trim() + ';';
    }
    return finalString.slice(0, -1);
  }

  private userInputValidator(): ValidatorFn {
    return (control: FormControl<string>): { [key: string]: { [key: string]: string } } | null => {
      const listOfMembers: string[] = control.value.split('\n');
      for (const line of listOfMembers) {
        const parsedLine: string = this.parseMemberLine(line);
        // cut line in case of very long input
        let helperLine = line;
        if (line.length > 25) {
          helperLine = line.substring(0, 25) + '...';
        }
        if (parsedLine === 'format') {
          return { invalidFormat: { value: helperLine } };
        }
        if (parsedLine === 'email') {
          return { invalidEmail: { value: helperLine } };
        }
      }

      return null;
    };
  }
}
