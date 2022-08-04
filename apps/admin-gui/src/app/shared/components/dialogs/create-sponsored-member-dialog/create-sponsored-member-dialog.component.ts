import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AuthzResolverService,
  InputCreateSponsoredMember,
  MembersManagerService,
  NamespaceRules,
  RichMember,
  RichUser,
  User,
  UsersManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  StoreService,
} from '@perun-web-apps/perun/services';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '@perun-web-apps/perun/models';
import { CustomValidators, emailRegexString, enableFormControl } from '@perun-web-apps/perun/utils';
import { loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';
import { MatStepper } from '@angular/material/stepper';

export interface CreateSponsoredMemberDialogData {
  entityId?: number;
  voId?: number;
  sponsors?: RichUser[];
  theme: string;
}

@Component({
  selector: 'app-create-sponsored-member-dialog',
  templateUrl: './create-sponsored-member-dialog.component.html',
  styleUrls: ['./create-sponsored-member-dialog.component.scss'],
})
export class CreateSponsoredMemberDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  theme: string;
  loading = false;
  functionalityNotSupported = false;
  loginThatWasSet = '';
  successfullyCreated = false;
  createdMember: RichMember;

  namespaceOptions: string[] = [];
  selectedNamespace: string = null;
  userControl: UntypedFormGroup = null;
  namespaceControl: UntypedFormGroup = null;
  voSponsors: RichUser[] = [];
  selectedSponsor: User = null;
  sponsorType = 'self';
  isSponsor = false;
  isPerunAdmin = false;
  private namespaceRules: NamespaceRules[] = [];
  private parsedRules: Map<string, { login: string; password: string }> = new Map<
    string,
    { login: string; password: string }
  >();
  private expiration = 'never';

  constructor(
    private dialogRef: MatDialogRef<CreateSponsoredMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateSponsoredMemberDialogData,
    private membersService: MembersManagerService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private usersService: UsersManagerService,
    private store: StoreService,
    private translator: TranslateService,
    private authzService: AuthzResolverService,
    private guiAuthResolver: GuiAuthResolver,
    private formBuilder: UntypedFormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  private static parseAttributes(
    field: { login: string; password: string },
    attributes: string[],
    type: string
  ): void {
    for (const att of attributes) {
      switch (att) {
        case 'login': {
          field.login = type;
          break;
        }
        case 'password': {
          field.password = type;
          break;
        }
        default:
          break;
      }
    }
  }

  onConfirm(): void {
    this.loading = true;

    const sponsoredMember: InputCreateSponsoredMember = {
      vo: this.data.voId,
      userData: {
        firstName: this.userControl.get('firstName').value as string,
        lastName: this.userControl.get('lastName').value as string,
        titleAfter: this.userControl.get('titleAfter').value as string,
        titleBefore: this.userControl.get('titleBefore').value as string,
        email: this.namespaceControl.get('email').value as string,
      },
      sponsor:
        this.sponsorType === 'other'
          ? this.selectedSponsor.id
          : this.store.getPerunPrincipal().userId,
    };

    const namespace: string = this.namespaceControl.get('namespace').value as string;
    const rules = this.parsedRules.get(namespace);
    if (namespace !== 'No namespace') {
      sponsoredMember.userData.namespace = namespace;
    }

    if (rules.login !== 'disabled') {
      sponsoredMember.userData.login = this.namespaceControl.get('login').value as string;
    }

    if (rules.password !== 'disabled') {
      sponsoredMember.sendActivationLink = this.namespaceControl.get('passwordReset')
        .value as boolean;
      sponsoredMember.userData.password = this.namespaceControl.get('passwordCtrl').value as string;
    }

    if (this.expiration !== 'never') {
      sponsoredMember.validityTo = this.expiration;
    }

    this.membersService.createSponsoredMember(sponsoredMember).subscribe(
      (richMember) => {
        this.successfullyCreated = true;
        this.dialogRef.updateSize('600px');
        this.createdMember = richMember;
        if (!!richMember && !!richMember.userAttributes) {
          richMember.userAttributes
            .filter((attr) => attr.baseFriendlyName === 'login-namespace')
            .filter((attr) => attr.friendlyNameParameter === namespace)
            .filter((attr) => attr.value !== null)
            .forEach((attr) => {
              this.loginThatWasSet = attr.value as string;
            });
        }
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  onCancel(): void {
    if (this.successfullyCreated) {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close();
    }
  }

  onNamespaceChanged(namespc: string): void {
    this.selectedNamespace = namespc;
    const rules = this.parsedRules.get(namespc);
    const login = this.namespaceControl.get('login');
    const password = this.namespaceControl.get('passwordCtrl');
    const passwordAgain = this.namespaceControl.get('passwordAgainCtrl');
    const passwordReset = this.namespaceControl.get('passwordReset');

    if (rules.login !== 'disabled') {
      const validators = rules.login === 'optional' ? [] : [Validators.required];
      enableFormControl(login, validators);
    } else {
      login.disable();
      login.setValue('');
    }
    if (rules.password !== 'disabled') {
      const validators = rules.password === 'optional' ? [] : [Validators.required];
      enableFormControl(password, validators, [
        loginAsyncValidator(namespc, this.usersService, this.apiRequestConfiguration),
      ]);
      enableFormControl(passwordAgain, []);
      enableFormControl(passwordReset, []);
      this.namespaceControl.get('passwordReset').setValue(false);
    } else {
      password.disable();
      password.setValue('');
      passwordAgain.disable();
      passwordAgain.setValue('');
      passwordReset.disable();
      passwordReset.setValue(false);
    }
  }

  passwordResetChange(): void {
    const password = this.namespaceControl.get('passwordCtrl');
    const passwordAgain = this.namespaceControl.get('passwordAgainCtrl');
    if (this.namespaceControl.get('passwordReset').value) {
      password.disable();
      password.setValue('');
      passwordAgain.disable();
      passwordAgain.setValue('');
    } else {
      password.enable();
      passwordAgain.enable();
    }
  }

  setExpiration(newExpiration: string): void {
    if (newExpiration === 'never') {
      this.expiration = 'never';
    } else {
      this.expiration = formatDate(newExpiration, 'yyyy-MM-dd', 'en-GB');
    }
  }

  getStepperNextConditions(): boolean {
    switch (this.stepper.selectedIndex) {
      case 0:
        return this.userControl.invalid;
      case 1:
        return this.namespaceControl.invalid || this.namespaceControl.get('passwordCtrl').pending;
      default:
        return false;
    }
  }

  stepperPrevious(): void {
    this.stepper.previous();
  }

  stepperNext(): void {
    this.stepper.next();
  }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.voSponsors = this.data.sponsors;
    this.isSponsor = this.guiAuthResolver.principalHasRole(Role.SPONSOR, 'Vo', this.data.voId);
    this.isPerunAdmin = this.guiAuthResolver.isPerunAdmin();
    this.sponsorType = this.isSponsor ? 'self' : 'other';
    this.userControl = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      titleBefore: [''],
      titleAfter: [''],
    });

    this.namespaceControl = this.formBuilder.group(
      {
        namespace: ['', Validators.required],
        login: ['', [Validators.required]],
        passwordCtrl: [
          '',
          Validators.required,
          [loginAsyncValidator(null, this.usersService, this.apiRequestConfiguration)],
        ],
        passwordAgainCtrl: [''],
        passwordReset: [false, []],
        email: ['', [Validators.required, Validators.pattern(emailRegexString)]],
      },
      {
        validators: CustomValidators.passwordMatchValidator as ValidatorFn,
      }
    );

    this.membersService.getAllNamespacesRules().subscribe((rules) => {
      if (this.store.get('allow_empty_sponsor_namespace')) {
        this.namespaceRules.push({
          namespaceName: 'No namespace',
          requiredAttributes: [],
          optionalAttributes: [],
        });
      }

      this.namespaceRules = this.namespaceRules.concat(rules);
      this.parseNamespaceRules();
      if (this.namespaceOptions.length === 0) {
        this.functionalityNotSupported = true;
      }
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  private parseNamespaceRules(): void {
    for (const rule of this.namespaceRules) {
      this.namespaceOptions.push(rule.namespaceName);

      const fieldTypes = { login: 'disabled', password: 'disabled' };
      CreateSponsoredMemberDialogComponent.parseAttributes(
        fieldTypes,
        rule.requiredAttributes,
        'required'
      );
      CreateSponsoredMemberDialogComponent.parseAttributes(
        fieldTypes,
        rule.optionalAttributes,
        'optional'
      );

      this.parsedRules.set(rule.namespaceName, fieldTypes);
    }
  }
}
