import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Attribute,
  AttributesManagerService,
  MembersManagerService,
} from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';

export interface PasswordResetRequestDialogData {
  userId: number;
  memberId: number;
  logins: Attribute[];
}

@Component({
  selector: 'app-password-reset-request-dialog',
  templateUrl: './password-reset-request-dialog.component.html',
  styleUrls: ['./password-reset-request-dialog.component.scss'],
})
export class PasswordResetRequestDialogComponent implements OnInit {
  languages = this.store.get('supported_languages') as string;
  selectedLang = 'en';
  pwdMails = new Map<string, string>();
  logins: Attribute[] = [];
  selectedLogin: Attribute;
  selectedMail = 'user:preferredMail';
  loading: boolean;
  mails: string[] = [];
  successMessage: string;

  constructor(
    private dialogRef: MatDialogRef<PasswordResetRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: PasswordResetRequestDialogData,
    private membersManagerService: MembersManagerService,
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private translate: TranslateService,
    private notificator: NotificatorService
  ) {
    translate
      .get('DIALOGS.PASSWORD_RESET_REQUEST.SUCCESS')
      .subscribe((res: string) => (this.successMessage = res));
  }

  ngOnInit(): void {
    this.getMailAttributes();
    this.logins = this.data.logins;
    this.selectedLogin = this.logins[0];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.loading = true;
    const namespace: string = this.selectedLogin.friendlyNameParameter as unknown as string;
    const currentUrl = window.location.href;
    const splittedUrl = currentUrl.split('/');
    const domain = splittedUrl[0] + '//' + splittedUrl[2]; // protocol with domain

    this.membersManagerService
      .sendPasswordResetLinkEmail(
        this.data.memberId,
        namespace,
        this.pwdMails.get(this.selectedMail),
        this.selectedLang,
        domain
      )
      .subscribe(
        () => {
          this.notificator.showSuccess(this.successMessage);
          this.loading = false;
          this.dialogRef.close();
        },
        () => (this.loading = false)
      );
  }

  private getMailAttributes(): void {
    this.pwdMails.set('user:preferredMail', 'urn:perun:user:attribute-def:def:preferredMail');
    this.pwdMails.set('member:mail', 'urn:perun:member:attribute-def:def:mail');
    this.mails = Array.from(this.pwdMails.keys());
    this.selectedMail = 'user:preferredMail';
  }
}
