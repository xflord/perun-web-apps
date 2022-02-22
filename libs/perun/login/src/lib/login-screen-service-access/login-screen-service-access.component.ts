import { Component, OnInit } from '@angular/core';
import { AuthzResolverService, PerunPrincipal } from '@perun-web-apps/perun/openapi';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-login-screen-service-access',
  templateUrl: './login-screen-service-access.component.html',
  styleUrls: ['./login-screen-service-access.component.css'],
})
export class LoginScreenServiceAccessComponent implements OnInit {
  usernameCtrl: FormControl;
  passwordCtrl: FormControl;
  principal: PerunPrincipal;
  wrongUsernameOrPassword = false;

  constructor(private authzService: AuthzResolverService) {}

  ngOnInit(): void {
    this.usernameCtrl = new FormControl(null, [Validators.required]);
    this.passwordCtrl = new FormControl(null, [Validators.required]);
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
