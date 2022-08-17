import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LinkerResult } from '@perun-web-apps/lib-linker';
import { OAuthService } from 'angular-oauth2-oidc';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig, parseQueryParams } from '@perun-web-apps/perun/utils';
import { SendMessageDialogComponent } from '../send-message-dialog/send-message-dialog.component';

@Component({
  selector: 'perun-web-apps-show-result',
  templateUrl: './show-result.component.html',
  styleUrls: ['./show-result.component.css'],
})
export class ShowResultComponent implements OnInit {
  linkerResult: LinkerResult = 'UNKNOWN_ERROR';
  loading = false;
  openerWindow = window.opener as Window;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private oauthService: OAuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.linkerResult = params['result'] as LinkerResult;
      this.openerWindow.postMessage(this.linkerResult, '*');
    });
  }

  closeWindow(): void {
    window.close();
  }

  loginAgain(): void {
    let queryParams = location.search.substring(1);
    if (this.linkerResult === 'IDENTITY_UNKNOWN') {
      let index = 0;
      let formAccessToken = 'yes';
      while (formAccessToken !== '') {
        index++;
        formAccessToken = parseQueryParams('formerToken' + index.toString(), queryParams);
      }
      queryParams += '&formerToken' + index.toString() + '=' + this.oauthService.getAccessToken();
    }
    sessionStorage.setItem('auth:queryParams', queryParams);
    this.oauthService.initLoginFlow();
  }

  sendMessageToSupport(): void {
    const config = getDefaultDialogConfig();
    config.width = '1000px';

    const dialogRef = this.dialog.open(SendMessageDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success === true) {
        this.linkerResult = 'MESSAGE_SENT_TO_SUPPORT';
        this.openerWindow.postMessage(this.linkerResult, '*');
      } else if (success === false) {
        this.linkerResult = 'UNKNOWN_ERROR';
        this.openerWindow.postMessage(this.linkerResult, '*');
      }
    });
  }
}
