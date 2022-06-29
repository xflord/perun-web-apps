import { Component } from '@angular/core';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { Observable } from 'rxjs';
import { OtherApplicationsService, StoreService } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { ActivateLocalAccountDialogComponent } from '../../../components/dialogs/activate-local-account-dialog/activate-local-account-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-settings-local-account',
  templateUrl: './settings-local-account.component.html',
  styleUrls: ['./settings-local-account.component.scss'],
})
export class SettingsLocalAccountComponent {
  userId: number = this.store.getPerunPrincipal().userId;
  namespace: string = this.store.get('local_account_namespace') as string;
  loginExists$: Observable<boolean> = this.userService.loginExist(this.userId, this.namespace);

  constructor(
    private userService: UsersManagerService,
    private store: StoreService,
    private appUrlService: OtherApplicationsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  openPwdReset(): void {
    let url = this.appUrlService.getUrlForOtherApplication('pwdReset', this.namespace);
    const mode = 'reset';
    url += '&' + mode + '=true';
    window.open(url, '_blank');
  }

  activateAccount(): void {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      userId: this.userId,
      namespace: this.namespace,
    };

    const dialogRef = this.dialog.open(ActivateLocalAccountDialogComponent, config);
    dialogRef.afterClosed().subscribe(() => {
      void this.router.navigate(['/profile', 'settings', 'localAccount'], {
        queryParamsHandling: 'merge',
      });
    });
  }
}
