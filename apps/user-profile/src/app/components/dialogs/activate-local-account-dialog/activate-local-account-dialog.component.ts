import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { CustomValidators } from '@perun-web-apps/perun/utils';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService, NotificatorService } from '@perun-web-apps/perun/services';
import { switchMap } from 'rxjs/operators';
import { loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';

export interface ActivateLocalAccountData {
  userId: number;
  namespace: string;
}

@Component({
  selector: 'perun-web-apps-activate-local-account-dialog',
  templateUrl: './activate-local-account-dialog.component.html',
  styleUrls: ['./activate-local-account-dialog.component.scss'],
})
export class ActivateLocalAccountDialogComponent {
  loading = false;
  lang: string = this.translate.currentLang;
  pwdForm = this.formBuilder.group(
    {
      passwordCtrl: [
        '',
        Validators.required,
        [loginAsyncValidator(this.data.namespace, this.userManager, this.apiRequestConfiguration)],
      ],
      passwordAgainCtrl: ['', Validators.required],
    },
    {
      validators: CustomValidators.passwordMatchValidator as ValidatorFn,
    }
  );

  constructor(
    private dialogRef: MatDialogRef<ActivateLocalAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActivateLocalAccountData,
    private userManager: UsersManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private apiRequestConfiguration: ApiRequestConfigurationService
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  activate(): void {
    this.loading = true;
    const pwd: string = this.pwdForm.get('passwordCtrl').value as string;
    this.userManager
      .reservePasswordForUser(this.data.userId, this.data.namespace, pwd)
      .pipe(
        switchMap(() =>
          this.userManager.validatePasswordForUser(this.data.userId, this.data.namespace)
        )
      )
      .subscribe(
        () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.ACTIVATE_LOCAL_ACCOUNT.SUCCESS') as string
          );
          this.dialogRef.close();
        },
        () => (this.loading = false)
      );
  }
}
