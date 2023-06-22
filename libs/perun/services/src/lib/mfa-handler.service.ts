import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Observable } from 'rxjs';
import {
  MfaRequiredDialogComponent,
  FocusOnMfaWindowComponent,
  NoMfaTokensDialogComponent,
} from '@perun-web-apps/perun/multi-factor-authentication';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';

export type MfaExceptionType =
  | 'MfaPrivilegeException'
  | 'MfaRolePrivilegeException'
  | 'MfaTimeoutException'
  | 'MfaRoleTimeoutException';

@Injectable({
  providedIn: 'root',
})
export class MfaHandlerService {
  constructor(
    private dialog: MatDialog,
    private oauthService: OAuthService,
    private authService: AuthService,
    private store: StoreService
  ) {}

  /**
   * 1) This function firstly opens a dialog that tells the user that MFA is required
   * 2) If the user clicks on "Verify", then the new window will be opened and this
   * window will handle MFA
   * 3) In the original application is opened dialog which indicates, that there is
   * opened another window and the user cannot continue in the original application
   * without finishing authentication/closing the second window
   */
  openMfaWindow(mfaExceptionType: MfaExceptionType): Observable<boolean> {
    let newWindow: Window = null;
    let dialogRef: MatDialogRef<FocusOnMfaWindowComponent, void> = null;

    const configVerify = getDefaultDialogConfig();
    configVerify.width = '450px';
    configVerify.data = {
      mfaRoleException:
        mfaExceptionType === ('MfaRolePrivilegeException' || 'MfaRoleTimeoutException'),
    };
    const dialogVerifyRef = this.dialog.open(MfaRequiredDialogComponent, configVerify);
    let verificationSkipped = false;

    dialogVerifyRef.afterClosed().subscribe((result) => {
      if (result) {
        if (mfaExceptionType === ('MfaTimeoutException' || 'MfaRoleTimeoutException')) {
          localStorage.setItem('mfaTimeout', 'true');
        }

        localStorage.setItem('mfaRequired', 'true');

        // save tokens - if MFA will NOT be successful, we will need to give them back to oauth storage
        sessionStorage.setItem('oldAccessToken', this.oauthService.getAccessToken());
        sessionStorage.setItem('oldRefreshToken', this.oauthService.getRefreshToken());

        newWindow = this.setupMfaWindow();

        if (newWindow) {
          const config = getDefaultDialogConfig();
          config.width = '450px';
          config.panelClass = 'noBorderDialog';

          dialogRef = this.dialog.open(FocusOnMfaWindowComponent, config);
        }
      } else {
        verificationSkipped = true;
      }
    });

    // open no mfa token dialog
    if (localStorage.getItem('noMfaTokenDialog')) {
      localStorage.removeItem('noMfaTokenDialog');
      const configNoToken = getDefaultDialogConfig();
      configNoToken.width = '450px';
      configNoToken.data = {
        tokensUrl: this.store.getProperty('mfa').url_en,
      };
      this.dialog.open(NoMfaTokensDialogComponent, configNoToken);
    }

    return new Observable((observer) => {
      const timer = setInterval(() => {
        if (newWindow?.closed) {
          clearInterval(timer);
          dialogRef.close();
          localStorage.removeItem('mfaRequired');
          localStorage.removeItem('mfaProcessed');
          localStorage.removeItem('mfaTimeout');
          // if the window is closed without successful MFA, then give back previous tokens to the oauth storage
          if (this.oauthService.getAccessToken() === null) {
            localStorage.setItem('access_token', sessionStorage.getItem('oldAccessToken'));
            localStorage.setItem('refresh_token', sessionStorage.getItem('oldRefreshToken'));
          }
          return observer.next(true);
        }
        if (verificationSkipped) {
          clearInterval(timer);
          return observer.next(false);
        }
      }, 1000);
    });
  }

  /**
   * This method catch unmet_authentication_requirements error, which means that
   * user doesn't have any active MFA token
   * @param error err?.params?.error
   */
  catchNoMfaTokenError(error: string): void {
    if (error === 'unmet_authentication_requirements') {
      localStorage.setItem('noMfaTokenDialog', 'true');
      window.close();
    }
  }

  /**
   * This function handles application which is opened just for executing MFA
   * If the window for MFA is opened, log out from single factor and force
   * multi factor authentication
   */
  mfaWindowForceLogout(): void {
    if (localStorage.getItem('mfaRequired') && !localStorage.getItem('mfaProcessed')) {
      localStorage.setItem('mfaProcessed', 'true');
      this.oauthService.logOut(true);
      this.authService.loadOidcConfigData();
      return void this.oauthService.loadDiscoveryDocumentAndLogin();
    } else {
      localStorage.removeItem('mfaRequired');
    }
  }

  /**
   * This function handles application which is opened just for executing MFA
   * If MFA is successfully done, then close the window
   */
  closeMfaWindow(): void {
    if (localStorage.getItem('mfaProcessed') && !localStorage.getItem('mfaRequired')) {
      localStorage.removeItem('mfaProcessed');
      localStorage.removeItem('mfaTimeout');
      window.close();
    }
  }

  private setupMfaWindow(): Window {
    const url = location.pathname + location.search;
    const width = 600;
    const height = 600;
    const topmostWindow = window.top;

    const top = topmostWindow.outerHeight / 2 + topmostWindow.screenY - height / 2;
    const left = topmostWindow.outerWidth / 2 + topmostWindow.screenX - width / 2;

    return window.open(url, '_blank', `width=${width},height=${height},top=${top}, left=${left}`);
  }
}
