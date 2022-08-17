import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { parseQueryParams } from '@perun-web-apps/perun/utils';
import { StoreService } from '@perun-web-apps/perun/services';
import { OAuthStorage } from 'angular-oauth2-oidc';
import {
  AuthzResolverService,
  RTMessagesManagerService,
  User,
} from '@perun-web-apps/perun/openapi';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';

// eslint-disable-next-line
declare let require: any;

@Component({
  selector: 'perun-web-apps-send-message-dialog',
  templateUrl: './send-message-dialog.component.html',
  styleUrls: ['./send-message-dialog.component.scss'],
})
export class SendMessageDialogComponent {
  loading = false;
  message =
    'Hello, during the linking of my accounts I encountered a situation where ' +
    'the system cannot automatically link these accounts. Therefore I want to ask you ' +
    'for help with linking my accounts.';

  constructor(
    private dialogRef: MatDialogRef<SendMessageDialogComponent>,
    private storeService: StoreService,
    private authzService: AuthzResolverService,
    private oAuthStorage: OAuthStorage,
    private rtMessages: RTMessagesManagerService,
    private userFullNamePipe: UserFullNamePipe
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSend(): void {
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
        .subscribe({
          next: () => {
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading = false;
            this.dialogRef.close(false);
          },
        });
    });
  }

  getFullEmailBody(currentUser: User, formerUser: User): string {
    const instance = this.storeService.getProperty('config');
    let text =
      this.message +
      '\n________________________________________________________________________\n\n' +
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
