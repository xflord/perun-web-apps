import { Component, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  UsersManagerService,
} from '@perun-web-apps/perun/openapi';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-settings-samba-password',
  templateUrl: './settings-samba-password.component.html',
  styleUrls: ['./settings-samba-password.component.scss'],
})
export class SettingsSambaPasswordComponent implements OnInit {
  showPassword: boolean;
  sambaExists: boolean;
  sambaAttribute: Attribute;
  sambaControl: FormControl;
  userId: number;
  showPwdTooltip: string;
  hidePwdTooltip: string;
  successMessage: string;

  constructor(
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private usersManagerService: UsersManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {
    translate
      .get('SAMBA_PASSWORD.SUCCESS_MESSAGE')
      .subscribe((res: string) => (this.successMessage = res));
    translate
      .get('SAMBA_PASSWORD.SHOW_PWD_TOOLTIP')
      .subscribe((res: string) => (this.showPwdTooltip = res));
    translate
      .get('SAMBA_PASSWORD.HIDE_PWD_TOOLTIP')
      .subscribe((res: string) => (this.hidePwdTooltip = res));
  }

  ngOnInit(): void {
    this.userId = this.store.getPerunPrincipal().userId;
    this.sambaControl = new FormControl('', [
      Validators.pattern(
        '((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])|(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&/=?_.,:;\\-])|(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%&/=?_.,:;\\-])|(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&/=?_.,:;\\-])).{3,}'
      ),
    ]);
    this.getSambaAttribute();
  }

  setSambaPassword(): void {
    this.sambaAttribute.value = this.sambaControl.value as object;

    const timestamp = new Date().getTime().toString();
    this.usersManagerService
      .createAlternativePassword(
        this.userId,
        timestamp,
        'samba-du',
        this.sambaControl.value as string
      )
      .subscribe(() => {
        this.sambaControl.setValue('');
        this.getSambaAttribute();
        this.notificator.showSuccess(this.successMessage);
      });
  }

  getSambaAttribute(): void {
    this.attributesManagerService
      .getUserAttributeByName(this.userId, 'urn:perun:user:attribute-def:def:altPasswords:samba-du')
      .subscribe((att) => {
        this.sambaExists = !!att.value;
        this.sambaAttribute = att;
      });
  }
}
