import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '@perun-web-apps/perun/utils';
import { loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';
import { ApiRequestConfigurationService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface ChangePasswordDialogData {
  namespace: string;
  login: string;
}

@Component({
  selector: 'perun-web-apps-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent implements OnInit {

  formGroup: FormGroup;
  oldPwd: AbstractControl;
  showOldPassword = false;
  newPwd: AbstractControl;
  newPwdAgain: AbstractControl;
  successMessage: string;
  loading: boolean;

  constructor(private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: ChangePasswordDialogData,
              private _formBuilder: FormBuilder,
              private usersManagerService: UsersManagerService,
              private apiRequestConfiguration: ApiRequestConfigurationService,
              private notificator: NotificatorService,
              private translate: TranslateService) {
    translate.get('SHARED_LIB.PERUN.COMPONENTS.CHANGE_PASSWORD_DIALOG.SUCCESS').subscribe(m => this.successMessage = m);
  }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({
      oldPasswordCtrl: ['', Validators.required],
      passwordCtrl: ['', Validators.required, [loginAsyncValidator(this.data.namespace, this.usersManagerService, this.apiRequestConfiguration)]],
      passwordAgainCtrl: ['']
    }, {
      validator: CustomValidators.passwordMatchValidator
    });
    this.oldPwd = this.formGroup.get('oldPasswordCtrl');
    this.newPwd = this.formGroup.get('passwordCtrl');
    this.newPwdAgain = this.formGroup.get('passwordAgainCtrl');
  }

  close() {
    this.dialogRef.close(false);
  }

  changePassword() {
    this.loading = true;
    this.usersManagerService.changePasswordForLogin(this.data.login, this.data.namespace, this.newPwd.value, this.oldPwd.value, true).subscribe(() => {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    });
  }
}
