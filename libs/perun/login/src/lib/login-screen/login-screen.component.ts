import { Component, OnInit } from '@angular/core';
import { AuthService, PreferredLanguageService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent implements OnInit{

  constructor(private auth: AuthService,
              private translateService: TranslateService,
              private preferredLangService: PreferredLanguageService) { }

  ngOnInit() {
    const prefLang = this.preferredLangService.getPreferredLanguage(null);
    this.translateService.use(prefLang);
  }

  startAuth(): void {
    this.auth.startAuthentication();
  }
}
