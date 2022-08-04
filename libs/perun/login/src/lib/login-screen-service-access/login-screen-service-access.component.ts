import { Component, OnInit } from '@angular/core';
import { AuthzResolverService, PerunPrincipal } from '@perun-web-apps/perun/openapi';
import { UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-login-screen-service-access',
  templateUrl: './login-screen-service-access.component.html',
  styleUrls: ['./login-screen-service-access.component.css'],
})
export class LoginScreenServiceAccessComponent implements OnInit {
  usernameCtrl: UntypedFormControl;
  passwordCtrl: UntypedFormControl;
  principal: PerunPrincipal;
  wrongUsernameOrPassword = false;

  constructor(private authzService: AuthzResolverService) {}

  ngOnInit(): void {
    this.usernameCtrl = new UntypedFormControl(null, [Validators.required]);
    this.passwordCtrl = new UntypedFormControl(null, [Validators.required]);
  }

  startAuth(): void {
    sessionStorage.setItem('basicUsername', this.usernameCtrl.value as string);
    sessionStorage.setItem('basicPassword', this.passwordCtrl.value as string);
    this.authzService.getPerunPrincipal().subscribe(
      (principal) => {
        sessionStorage.setItem('baPrincipal', JSON.stringify(principal));
        location.reload();
      },
      () => {
        this.wrongUsernameOrPassword = true;
      }
    );
  }
}
