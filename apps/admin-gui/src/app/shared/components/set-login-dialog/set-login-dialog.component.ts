import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AttributesManagerService,
  MembersManagerService,
  UsersManagerService,
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
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
  formGroup: FormGroup;
  processing = false;
  userId: number;

  constructor(
    private dialogRef: MatDialogRef<SetLoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SetLoginDialogComponentData,
    private formBuilder: FormBuilder,
    private usersManagerService: UsersManagerService,
    private membersManagerService: MembersManagerService,
    private attributesManagerService: AttributesManagerService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.data.userId;
    this.formGroup = this.formBuilder.group(
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
      }
    );
  }

  ngAfterViewInit(): void {
    // detect form validators correctly
    this.cd.detectChanges();
  }

  onSetLogin(): void {
    this.processing = true;
    const namespace = (this.formGroup.get('namespaceCtrl').value as string).toLowerCase();
    const inputLogin = this.formGroup.get('loginCtrl').value as string;

    if (inputLogin) {
      this.setLogin(namespace, inputLogin);
    } else {
      const namespaceUrn = `urn:perun:user:attribute-def:def:login-namespace:${namespace}`;
      this.attributesManagerService
        .getUserAttributeByName(this.userId, 'urn:perun:user:attribute-def:core:lastName')
        .subscribe((attr) => {
          const lastName = attr.value as string;
          this.usersManagerService.generateAccountForName(namespace, lastName).subscribe(
            (params) => {
              const login = params[namespaceUrn];
              this.setLogin(namespace, login);
            },
            () => (this.processing = false)
          );
        });
    }
  }

  setLogin(namespace: string, login: string): void {
    this.usersManagerService.setLogin(this.userId, login, namespace).subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.SET_LOGIN.SUCCESS_LOGIN') as string
        );
        this.setPassword();
      },
      () => {
        this.processing = false;
      }
    );
  }

  setPassword(): void {
    const namespace: string = (this.formGroup.get('namespaceCtrl').value as string).toLowerCase();
    const password: string = this.formGroup.get('passwordCtrl').value as string;
    const generateRandom: boolean = this.formGroup.get('generatePasswordCtrl').value as boolean;

    if (generateRandom) {
      if (!this.formGroup.get('loginCtrl').value) {
        return; // password already set when account was generated
      }
      this.usersManagerService.reserveRandomPassword(this.userId, namespace).subscribe(
        () => {
          this.usersManagerService.validatePasswordForUser(this.userId, namespace).subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => {
              this.processing = false;
            }
          );
        },
        () => {
          this.processing = false;
        }
      );
    } else {
      this.usersManagerService
        .reservePasswordForUser({ user: this.userId, namespace: namespace, password: password })
        .subscribe(
          () => {
            this.usersManagerService.validatePasswordForUser(this.userId, namespace).subscribe(
              () => {
                this.notificator.showSuccess(
                  this.translate.instant('DIALOGS.SET_LOGIN.SUCCESS_PASSWORD') as string
                );
                this.dialogRef.close(true);
              },
              () => {
                this.processing = false;
              }
            );
          },
          () => {
            this.processing = false;
          }
        );
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
