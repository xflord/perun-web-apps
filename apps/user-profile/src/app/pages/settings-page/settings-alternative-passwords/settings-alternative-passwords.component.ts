import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { StoreService } from '@perun-web-apps/perun/services';
import { AttributesManagerService, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ShowGeneratedPasswordDialogComponent } from '../../../components/dialogs/show-generated-password-dialog/show-generated-password-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { RemoveAltPasswordDialogComponent } from '../../../components/dialogs/remove-alt-password-dialog/remove-alt-password-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-settings-alternative-passwords',
  templateUrl: './settings-alternative-passwords.component.html',
  styleUrls: ['./settings-alternative-passwords.component.scss'],
})
export class SettingsAlternativePasswordsComponent implements OnInit {
  altPasswordCtrl = new FormControl(null, [Validators.required]);
  userId = this.store.getPerunPrincipal().userId;
  removeDialogTitle: string;
  removeDialogDescription: string;
  passwordDescriptions = new Set<string>();
  displayedValues: string[] = [];
  selection = new SelectionModel<string>(false, []);
  altPasswordsAttributeValue: Map<string, string>;
  alertText: string;
  headerColumnText: string;
  loading: boolean;

  constructor(
    private store: StoreService,
    private attributesManagerService: AttributesManagerService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private usersManagerService: UsersManagerService
  ) {
    translateService
      .get('ALT_PASSWORDS.REMOVE_DIALOG_DESCRIPTION')
      .subscribe((value: string) => (this.removeDialogDescription = value));
    translateService
      .get('ALT_PASSWORDS.REMOVE_DIALOG_TITLE')
      .subscribe((value: string) => (this.removeDialogTitle = value));
    translateService
      .get('ALERTS.NO_ALT_PASSWORDS')
      .subscribe((value: string) => (this.alertText = value));
    translateService
      .get('ALT_PASSWORDS.HEADER_COLUMN')
      .subscribe((value: string) => (this.headerColumnText = value));
  }

  ngOnInit(): void {
    this.getAltPasswords();
  }

  createPassword(): void {
    const password = this.generatePassword();
    this.usersManagerService
      .createAlternativePassword({
        user: this.userId,
        description: this.altPasswordCtrl.value as string,
        loginNamespace: 'einfra',
        password: password,
      })
      .subscribe(() => {
        const config = getDefaultDialogConfig();
        config.width = '600px';
        config.data = { password: password };

        this.dialog.open(ShowGeneratedPasswordDialogComponent, config);
        this.getAltPasswords();
        this.altPasswordCtrl.setValue('');
      });
  }

  generatePassword(): string {
    const length = 16,
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&/=?_.,:;\\-';
    let retVal = '';
    let i = 0;
    const n = charset.length;
    for (; i < length; ++i) {
      retVal += charset.charAt(Math.random() * n);
    }
    if (
      !retVal.match(
        '((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])|(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&/=?_.,:;\\-])|(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&/=?_.,:;\\-])|(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&/=?_.,:;\\-])).{3,}'
      )
    ) {
      this.generatePassword();
    }
    return retVal;
  }

  alreadyContainsValue(value: string): boolean {
    return this.passwordDescriptions.has(value);
  }

  removeAltPasswords(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      description: this.selection.selected,
      passwordId: this.altPasswordsAttributeValue.get(this.selection.selected[0]),
      userId: this.userId,
    };

    const dialogRef = this.dialog.open(RemoveAltPasswordDialogComponent, config);

    dialogRef.afterClosed().subscribe((added) => {
      if (added) {
        this.getAltPasswords();
        this.selection.clear();
      }
    });
  }

  private getAltPasswords(): void {
    this.loading = true;
    this.attributesManagerService
      .getUserAttributeByName(this.userId, `urn:perun:user:attribute-def:def:altPasswords:einfra`)
      .subscribe((att) => {
        if (att.value) {
          this.altPasswordsAttributeValue = new Map<string, string>(
            Object.entries(att.value as { [s: string]: string })
          );
          const altPasswordsKeys = this.altPasswordsAttributeValue.keys();
          this.passwordDescriptions = new Set<string>(altPasswordsKeys);
          this.displayedValues = Array.from(this.passwordDescriptions.values());
        } else {
          this.displayedValues = [];
        }
        this.loading = false;
      });
  }
}
