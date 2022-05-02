import { Component } from '@angular/core';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { Observable } from 'rxjs';
import { OtherApplicationsService, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-settings-local-account',
  templateUrl: './settings-local-account.component.html',
  styleUrls: ['./settings-local-account.component.scss'],
})
export class SettingsLocalAccountComponent {
  namespace: string = this.store.get('local_account_namespace') as string;
  loginExists$: Observable<boolean> = this.userService.loginExist(
    this.store.getPerunPrincipal().userId,
    this.namespace
  );

  constructor(
    private userService: UsersManagerService,
    private store: StoreService,
    private appUrlService: OtherApplicationsService
  ) {}

  openPwdReset(activate: boolean): void {
    let url = this.appUrlService.getUrlForOtherApplication('pwdReset', this.namespace);
    const mode = activate ? 'activation' : 'reset';
    url += '&' + mode + '=true';
    window.open(url, '_blank');
  }
}
