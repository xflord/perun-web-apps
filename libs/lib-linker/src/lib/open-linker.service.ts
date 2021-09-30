import { Injectable } from '@angular/core';
import { OtherApplicationsService, StoreService } from '@perun-web-apps/perun/services';
import { OAuthService } from 'angular-oauth2-oidc';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog/dialog-ref';
import { FocusOnLinkerDialogComponent } from './focus-on-linker-dialog/focus-on-linker-dialog.component';
import { LinkerResult } from './models/LinkerResult';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Injectable({
  providedIn: 'root',
})
export class OpenLinkerService {
  constructor(
    private otherApplicationsService: OtherApplicationsService,
    private storeService: StoreService,
    private oauthService: OAuthService,
    private dialog: MatDialog
  ) {}

  openLinkerWindow(processTheResult: (result: LinkerResult) => void, idpFilter?: string[]): void {
    let linkerUrl = this.otherApplicationsService.getUrlForOtherApplication('linker');
    //next 'if' is there for testing purposes, when you want to use localhost url of linker
    if (this.storeService.getProperty('use_localhost_linker_url')) {
      linkerUrl = 'http://localhost:4201/';
    }

    let url = linkerUrl + '?formerToken=' + this.oauthService.getAccessToken();
    if (idpFilter) {
      if (idpFilter.length !== 0) {
        url += '&idphint=' + idpFilter.toString();
      }
    }
    const width = 600;
    const height = 600;
    const topmostWindow = window.top;

    const top = topmostWindow.outerHeight / 2 + topmostWindow.screenY - height / 2;
    const left = topmostWindow.outerWidth / 2 + topmostWindow.screenX - width / 2;

    const newWindow = window.open(
      url,
      '_blank',
      `width=${width},height=${height},top=${top}, left=${left}`
    );

    let dialogRef: MatDialogRef<FocusOnLinkerDialogComponent, void>;
    if (newWindow) {
      const config = getDefaultDialogConfig();
      config.width = '450px';
      config.panelClass = 'noBorderDialog';

      dialogRef = this.dialog.open(FocusOnLinkerDialogComponent, config);
    }

    window.addEventListener('message', (ev: MessageEvent) => {
      const result = ev.data as string;
      sessionStorage.setItem('linkedResult', result);
    });

    const timer = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(timer);
        dialogRef.close();
        const result = sessionStorage.getItem('linkedResult');
        sessionStorage.removeItem('linkedResult');
        processTheResult(result as LinkerResult);
      }
    }, 1000);
  }
}
