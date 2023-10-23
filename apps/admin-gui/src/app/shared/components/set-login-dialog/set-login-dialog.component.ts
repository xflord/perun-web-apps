import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributesManagerService, UsersManagerService } from '@perun-web-apps/perun/openapi';
import {
  ApiRequestConfigurationService,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';
import { CustomValidators } from '@perun-web-apps/perun/utils';

export interface SetLoginDialogComponentData {
  userId: number;
  filteredNamespaces?: string[];
}

@Component({
  selector: 'app-perun-web-apps-set-login-dialog',
  templateUrl: './set-login-dialog.component.html',
  styleUrls: ['./set-login-dialog.component.scss'],
})
export class SetLoginDialogComponent implements OnInit, AfterViewInit {
  formGroup = this.formBuilder.group(
    {
      namespaceCtrl: ['Not selected'],
      loginCtrl: [
        '',
        [
          Validators.pattern('^[a-z][a-z0-9_-]+$'),
          Validators.maxLength(15),
          Validators.minLength(2),
        ],
      ],
      passwordCtrl: [
        '',
        Validators.required,
        [loginAsyncValidator(null, this.usersManagerService, this.apiRequestConfiguration)],
      ],
      passwordAgainCtrl: [''],
      generatePasswordCtrl: [true],
    },
    {
      validators: CustomValidators.passwordMatchValidator as ValidatorFn,
    },
  );
  processing = false;
  userId: number;

  constructor(
    private dialogRef: MatDialogRef<SetLoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SetLoginDialogComponentData,
    private formBuilder: FormBuilder,
    private usersManagerService: UsersManagerService,
    private attributesManagerService: AttributesManagerService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userId = this.data.userId;
  }

  ngAfterViewInit(): void {
    // detect form validators correctly
    this.cd.detectChanges();
  }

  onSetLogin(): void {
    this.processing = true;
    const namespace = this.formGroup.value.namespaceCtrl.toLowerCase();
    const inputLogin = this.formGroup.value.loginCtrl;

    if (inputLogin) {
      this.setLogin(namespace, inputLogin);
    } else {
      const namespaceUrn = `urn:perun:user:attribute-def:def:login-namespace:${namespace}`;
      this.attributesManagerService
        .getUserAttributeByName(this.userId, 'urn:perun:user:attribute-def:core:lastName')
        .subscribe((attr) => {
          const lastName = attr.value as string;
          this.usersManagerService.generateAccountForName(namespace, lastName).subscribe({
            next: (params) => {
              const login = params[namespaceUrn];
              this.setLogin(namespace, login);
            },
            error: () => (this.processing = false),
          });
        });
    }
  }

  setLogin(namespace: string, login: string): void {
    this.usersManagerService.setLogin(this.userId, login, namespace).subscribe({
      next: () => {
        this.notificator.showSuccess(this.translate.instant('DIALOGS.SET_LOGIN.SUCCESS_LOGIN'));
        this.setPassword();
      },
      error: () => {
        this.processing = false;
      },
    });
  }

  setPassword(): void {
    const namespace: string = this.formGroup.value.namespaceCtrl.toLowerCase();
    const password: string = this.formGroup.value.passwordCtrl;
    const generateRandom: boolean = this.formGroup.value.generatePasswordCtrl;

    if (generateRandom) {
      if (!this.formGroup.get('loginCtrl').value) {
        return; // password already set when account was generated
      }
      this.usersManagerService.reserveRandomPassword(this.userId, namespace).subscribe({
        next: () => {
          this.usersManagerService.validatePasswordForUser(this.userId, namespace).subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: () => {
              this.processing = false;
            },
          });
        },
        error: () => {
          this.processing = false;
        },
      });
    } else {
      this.usersManagerService
        .reservePasswordForUser({ user: this.userId, namespace: namespace, password: password })
        .subscribe({
          next: () => {
            this.usersManagerService.validatePasswordForUser(this.userId, namespace).subscribe({
              next: () => {
                this.notificator.showSuccess(
                  this.translate.instant('DIALOGS.SET_LOGIN.SUCCESS_PASSWORD'),
                );
                this.dialogRef.close(true);
              },
              error: () => {
                this.processing = false;
              },
            });
          },
          error: () => {
            this.processing = false;
          },
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
