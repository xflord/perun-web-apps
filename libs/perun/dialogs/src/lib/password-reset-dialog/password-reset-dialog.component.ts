import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ApiRequestConfigurationService,
  NotificatorService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CustomValidators } from '@perun-web-apps/perun/utils';
import { PasswordLabels } from '@perun-web-apps/perun/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ResetPasswordDialogData {
  namespace: string;
  login: string;
}

@Component({
  selector: 'perun-web-apps-password-reset-dialog',
  templateUrl: './password-reset-dialog.component.html',
  styleUrls: ['./password-reset-dialog.component.scss'],
})
export class PasswordResetDialogComponent implements OnInit {
  loading = false;
  language = 'en';
  newPasswdForm: FormGroup<{
    passwordCtrl: FormControl<string>;
    passwordAgainCtrl: FormControl<string>;
  }>;
  labels: PasswordLabels;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ResetPasswordDialogData,
    private dialogRef: MatDialogRef<PasswordResetDialogComponent>,
    private storeService: StoreService,
    private translate: TranslateService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private usersService: UsersManagerService,
    private formBuilder: FormBuilder,
    private notificator: NotificatorService
  ) {}

  ngOnInit(): void {
    this.newPasswdForm = this.formBuilder.group(
      {
        passwordCtrl: [
          '',
          Validators.required,
          [
            loginAsyncValidator(
              this.data.namespace,
              this.usersService,
              this.apiRequestConfiguration
            ),
          ],
        ],
        passwordAgainCtrl: ['', Validators.required],
      },
      {
        validators: CustomValidators.passwordMatchValidator as ValidatorFn,
      }
    );
    this.setLabels(this.translate.currentLang);
  }

  onSubmit(): void {
    this.loading = true;
    this.usersService
      .changePasswordForLogin({
        login: this.data.login,
        namespace: this.data.namespace,
        newPassword: this.newPasswdForm.value.passwordCtrl,
      })
      .subscribe(() => {
        this.notificator.showInstantSuccess(
          'SHARED_LIB.PERUN.COMPONENTS.RESET_PASSWORD_DIALOG.SUCCESS'
        );
        this.loading = false;
        this.dialogRef.close(true);
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private setLabels(lang: string): void {
    this.labels = this.storeService.getProperty(
      lang === 'en' ? 'password_labels' : 'password_labels_cs'
    );
  }
}
