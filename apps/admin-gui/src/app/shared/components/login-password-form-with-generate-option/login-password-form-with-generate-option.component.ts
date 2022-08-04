import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { enableFormControl } from '@perun-web-apps/perun/utils';
import { loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';
import { MembersManagerService, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-login-password-form-with-generate-option',
  templateUrl: './login-password-form-with-generate-option.component.html',
  styleUrls: ['./login-password-form-with-generate-option.component.scss'],
})
export class LoginPasswordFormWithGenerateOptionComponent {
  @Input() formGroup: UntypedFormGroup;
  @Input() filteredNamespace: string[] = null;
  @Output() parsedRulesOutput = new EventEmitter<Map<string, { login: string }>>();

  selectedNamespace: string = null;
  parsedRules: Map<string, { login: string }> = new Map<string, { login: string }>();

  constructor(
    private membersManagerService: MembersManagerService,
    private usersManagerService: UsersManagerService,
    private apiRequestConfiguration: ApiRequestConfigurationService
  ) {}

  parsedRulesFunction(rules: Map<string, { login: string }>): void {
    this.parsedRules = rules;
    this.parsedRulesOutput.emit(rules);
  }

  onNamespaceChanged(namespace: string): void {
    this.selectedNamespace = namespace.toLowerCase();
    const password = this.formGroup.get('passwordCtrl');
    const passwordAgain = this.formGroup.get('passwordAgainCtrl');
    const generatePassword = this.formGroup.get('generatePasswordCtrl');
    if (namespace !== 'Not selected') {
      enableFormControl(generatePassword, []);
      this.passwordOptionChanged();
    } else {
      password.disable();
      password.setValue('');
      passwordAgain.disable();
      passwordAgain.setValue('');
      generatePassword.disable();
      if (!generatePassword.dirty) {
        generatePassword.setValue(true);
      }
    }
  }

  passwordOptionChanged(): void {
    const password = this.formGroup.get('passwordCtrl');
    const passwordAgain = this.formGroup.get('passwordAgainCtrl');
    if (this.formGroup.get('generatePasswordCtrl').value) {
      password.disable();
      password.setValue('');
      passwordAgain.disable();
      passwordAgain.setValue('');
    } else {
      enableFormControl(
        password,
        [Validators.required],
        [
          loginAsyncValidator(
            this.selectedNamespace,
            this.usersManagerService,
            this.apiRequestConfiguration
          ),
        ]
      );
      enableFormControl(passwordAgain, []);
    }
  }
}
