import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ImmediateStateMatcher } from '../perun-namespace-password-form';
import { TranslateService } from '@ngx-translate/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { Attribute, UsersManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-password-form',
  templateUrl: './password-form.component.html',
  styleUrls: ['./password-form.component.scss'],
})
export class PasswordFormComponent implements OnInit, OnChanges {
  @Input() formGroup: UntypedFormGroup;
  @Input() passwordRequired = true;
  @Input() tooltipPwdViaEmail = false;
  @Input() tooltipPwdDisabledForNamespace = false;
  @Input() namespace: string;
  @Input() multiLanguage = false;
  @Input() language = 'en';

  passwordRequirement: string = null;
  showNewPassword = false;
  showPasswordConfirm = false;
  passwordStateMatcher: ImmediateStateMatcher = new ImmediateStateMatcher();
  private allPasswordRequirements: string[] = this.store.get(
    'password_requirements_help'
  ) as string[];

  constructor(
    private translator: TranslateService,
    private usersManagerService: UsersManagerService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    if (window.location.href.includes('/profile')) {
      this.usersManagerService
        .getRichUserWithAttributes(this.store.getPerunPrincipal().userId)
        .subscribe((richUser) => {
          const languageAttribute: Attribute = richUser.userAttributes.find(
            (att) => att.friendlyName === 'preferredLanguage'
          );
          this.language = (languageAttribute?.value as string) ?? 'en';

          if (this.language !== 'en') {
            this.allPasswordRequirements = this.store.get(
              `password_requirements_help_${this.language}`
            ) as string[];
          }

          this.changeHelp();
        });
    } else {
      this.changeHelp();
    }
  }

  ngOnChanges(): void {
    if (this.language !== 'en') {
      this.allPasswordRequirements = this.store.get(
        `password_requirements_help_${this.language}`
      ) as string[];
    } else {
      this.allPasswordRequirements = this.store.get('password_requirements_help') as string[];
    }

    this.changeHelp();
  }

  getPasswordDisabledTooltip(): string {
    if (this.tooltipPwdViaEmail) {
      return this.translator.instant(
        'SHARED_LIB.PERUN.COMPONENTS.PASSWORD_FORM_FIELD.TOOLTIP_PASSWORD_VIA_EMAIL'
      ) as string;
    } else {
      return this.translator.instant(
        'SHARED_LIB.PERUN.COMPONENTS.PASSWORD_FORM_FIELD.TOOLTIP_PASSWORD_DISABLED'
      ) as string;
    }
  }

  getErrorTooltip(): string {
    let err: string = this.formGroup.get('passwordCtrl').getError('backendError') as string;
    if (err) {
      err = err.replace(':null', '');
    }
    return err;
  }

  changeHelp(): void {
    this.passwordRequirement = this.allPasswordRequirements.find(
      (passReq) => passReq.split(':')[0] === this.namespace
    );
    if (this.passwordRequirement === undefined) {
      this.passwordRequirement = this.allPasswordRequirements
        .find((passReq) => passReq.split(':')[0] === 'default')
        .split(/:(.+)/)[1];
    } else {
      this.passwordRequirement = this.passwordRequirement.split(/:(.+)/)[1];
    }
  }
}
