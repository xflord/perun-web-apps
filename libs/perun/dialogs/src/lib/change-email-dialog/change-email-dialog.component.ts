import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, NotificatorService } from '@perun-web-apps/perun/services';

export interface ChangeEmailDialogData {
  userId: number;
}

@Component({
  selector: 'perun-web-apps-change-email-dialog',
  templateUrl: './change-email-dialog.component.html',
  styleUrls: ['./change-email-dialog.component.scss'],
})
export class ChangeEmailDialogComponent implements OnInit {
  successMessage: string;
  pendingMails: string[] = [];
  emailControl: UntypedFormControl;
  pendingEmailsMessageStart: string;
  pendingEmailsMessageEnd: string;
  pendingEmailsMessage: string;

  constructor(
    private dialogRef: MatDialogRef<ChangeEmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ChangeEmailDialogData,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private usersManagerService: UsersManagerService,
    private authService: AuthService
  ) {
    translate
      .get('DIALOGS.CHANGE_EMAIL.SUCCESS')
      .subscribe((res: string) => (this.successMessage = res));
    translate
      .get('DIALOGS.CHANGE_EMAIL.PENDING_MAILS_BEGIN')
      .subscribe((res: string) => (this.pendingEmailsMessageStart = res));
    translate
      .get('DIALOGS.CHANGE_EMAIL.PENDING_MAILS_END')
      .subscribe((res: string) => (this.pendingEmailsMessageEnd = res));
  }

  ngOnInit(): void {
    this.emailControl = new UntypedFormControl(null, [
      Validators.required,
      Validators.pattern(
        /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
      ),
    ]);
    this.usersManagerService
      .getPendingPreferredEmailChanges(this.data.userId)
      .subscribe((mails) => {
        this.pendingMails = mails.filter((el, i, a) => i === a.indexOf(el));
        let result = '';
        this.pendingMails.forEach(
          (mail) => (result += `${mail === this.pendingMails[0] ? '' : ', '}${mail}`)
        );
        this.pendingEmailsMessage =
          this.pendingEmailsMessageStart + result + this.pendingEmailsMessageEnd;
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const currentUrl = window.location.href;
    const splittedUrl = currentUrl.split('/');
    const domain = splittedUrl[0] + '//' + splittedUrl[2]; // protocol with domain

    this.usersManagerService
      .requestPreferredEmailChange(
        this.data.userId,
        this.emailControl.value as string,
        this.translate.currentLang,
        '',
        domain,
        this.authService.getIdpFilter()
      )
      .subscribe(() => {
        this.notificator.showSuccess(this.successMessage);
        this.dialogRef.close();
      });
  }
}
