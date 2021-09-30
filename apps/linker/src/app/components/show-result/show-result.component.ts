import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LinkerResult } from '@perun-web-apps/lib-linker';
import { OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { MatDialog } from '@angular/material/dialog';
import {
  AttributesManagerService,
  AuthzResolverService,
  RTMessagesManagerService,
  User,
} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { parseQueryParams } from '@perun-web-apps/perun/utils';

// eslint-disable-next-line
declare let require: any;

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
    private oauthService: OAuthService,
    private attributeService: AttributesManagerService,
    private storeService: StoreService,
    private authzService: AuthzResolverService,
    private rtMessages: RTMessagesManagerService,
    private userFullNamePipe: UserFullNamePipe,
    private oAuthStorage: OAuthStorage
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
    this.loading = true;
    const currentUser = this.storeService.getPerunPrincipal().user;

    const queryParams = location.search.substring(1);
    this.oAuthStorage.setItem('access_token', parseQueryParams('formerToken', queryParams));
    this.authzService.getPerunPrincipal().subscribe((principal) => {
      const formerUser = principal.user;
      this.rtMessages
        .sentMessageToRTWithQueue(
          'perun',
          'Account linking: The accounts could not be automatically linked.',
          this.getFullEmailBody(currentUser, formerUser)
        )
        .subscribe(
          () => {
            this.linkerResult = 'MESSAGE_SENT_TO_SUPPORT';
            this.openerWindow.postMessage(this.linkerResult, '*');
            this.loading = false;
          },
          () => {
            this.loading = false;
            this.linkerResult = 'UNKNOWN_ERROR';
            this.openerWindow.postMessage(this.linkerResult, '*');
          }
        );
    });
  }

  getFullEmailBody(currentUser: User, formerUser: User): string {
    const instance = this.storeService.getProperty('config');
    let text =
      'Account linking: The accounts could not be automatically linked.\n' +
      'The user proved his identities, but they were connected to different users.\n' +
      'By this message the user is asking for help with identity consolidation.\n';

    text = text.concat('\n\n');
    text = text.concat('Information about users: \n\n');

    text = text.concat(
      'First user: \nid=' +
        formerUser.id.toString() +
        '\nName: ' +
        this.userFullNamePipe.transform(formerUser) +
        '\n\n'
    );

    text = text.concat(
      'Second user: \n' +
        'id=' +
        currentUser.id.toString() +
        '\nName: ' +
        this.userFullNamePipe.transform(currentUser) +
        '\n\n'
    );

    text = text.concat('Perun instance: ' + instance + '\n');
    text = text.concat(
      'Sended from new Consolidator Gui, version: ',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      require('../../../../../../package.json').version as string
    );
    return text.split('\n').join('\n '); //add space after each new line
  }
}
