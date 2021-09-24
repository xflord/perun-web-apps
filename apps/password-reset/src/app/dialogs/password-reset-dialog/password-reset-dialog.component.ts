import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';
import { ImmediateStateMatcher, loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';

export interface PasswordResetDialogData {
  mode: string;
  token?: string;
  namespace?: string;
}

export class PasswordStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}


@Component({
  selector: 'perun-web-apps-password-reset-dialog',
  templateUrl: './password-reset-dialog.component.html',
  styleUrls: ['./password-reset-dialog.component.scss']
})
export class PasswordResetDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: PasswordResetDialogData,
    private translate: TranslateService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private usersService: UsersManagerService) { }

  oldPasswd: FormControl = new FormControl('', Validators.required);
  newPasswdForm = new FormGroup({
    password: new FormControl('', Validators.required,
      [loginAsyncValidator(this.data.namespace, this.usersService, this.apiRequestConfiguration)]),
    passwordConfirm: new FormControl('', Validators.required),
    showPassword: new FormControl(false),
  }, this.passwordMatchValidator);

  passwordStateMatcher = new PasswordStateMatcher();
  immediateStateMatcher = new ImmediateStateMatcher();

  mode = '';
  title = '';

  loading = false;
  success = false;

  ngOnInit(): void {
    this.loading = true;
    this.mode = this.data.mode;
    switch (this.mode) {
      case 'change': {
        this.title = this.translate.instant('DIALOGS.PASSWORD_CHANGE.TITLE_CHANGE');
        break;
      }
      case 'reset': {
        this.title = this.translate.instant('DIALOGS.PASSWORD_CHANGE.TITLE_RESET');
        break;
      }
      case 'activation': {
        this.title = this.translate.instant('DIALOGS.PASSWORD_CHANGE.TITLE_ACTIVATION');
        break;
      }
    }
    this.loading = false;
  }

  passwordMatchValidator(group: FormGroup) {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : {'mismatch': true};
  }

  onSubmit() {
    this.loading = true;
    this.usersService.changeNonAuthzPasswordByToken(this.data.token, this.newPasswdForm.get('password').value).subscribe(() => {
      this.success = true;
      this.loading = false;
    });
  }
}
