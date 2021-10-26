import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PasswordResetDialogComponent } from './dialogs/password-reset-dialog/password-reset-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { TokenExpiredDialogComponent } from './dialogs/token-expired-dialog/token-expired-dialog.component';
import { PreferredLanguageService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{

  constructor(private dialog: MatDialog,
              private usersService: UsersManagerService,
              private preferredLangService: PreferredLanguageService,
              private translateService:TranslateService) { }

  ngOnInit() {
    const prefLang = this.preferredLangService.getPreferredLanguage(null);
    this.translateService.use(prefLang);

    const queryParams = location.search.substr(1);
    let mode = ''
    if (queryParams.includes('activation')) {
      mode = 'activation'
    } else if(queryParams.includes('token')) {
      mode = 'reset'
    } else {
      mode = 'change'
    }

    const config = getDefaultDialogConfig();

    if (mode === 'reset') {
      const token = this.parseQueryParams('token', queryParams);
      const namespace = this.parseQueryParams('namespace', queryParams);

      this.usersService.checkPasswordResetRequestByTokenIsValid(token).subscribe(() => {
        config.width = '450px';
        config.data = {
          token: token,
          namespace: namespace,
          mode: mode
        }
        this.dialog.open(PasswordResetDialogComponent, config);
      }, () => {
        config.width = '600px';
        config.data = {mode: mode};
        this.dialog.open(TokenExpiredDialogComponent, config);
      });
    } else {
      config.width = '450px';
      config.data = {mode: mode};
      this.dialog.open(PasswordResetDialogComponent, config);
    }
  }

  parseQueryParams(paramName: string, queryParams: string) {
    const parameters = queryParams.split('&');
    for (const param of parameters) {
      const [name, value] = param.split('=');
      if (name.includes(paramName)){
        return value;
      }
    }
  }

}
