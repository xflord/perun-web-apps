import { Component } from '@angular/core';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-login-screen-service-access',
  templateUrl: './login-screen-service-access.component.html',
  styleUrls: ['./login-screen-service-access.component.css'],
})
export class LoginScreenServiceAccessComponent {
  usernameCtrl = new FormControl<string>(null, [Validators.required]);
  passwordCtrl = new FormControl<string>(null, [Validators.required]);
  wrongUsernameOrPassword = false;

  constructor(private authzService: AuthzResolverService) {}

  startAuth(): void {
    if (this.usernameCtrl.invalid || this.passwordCtrl.invalid) return;

    sessionStorage.setItem('basicUsername', this.usernameCtrl.value);
    sessionStorage.setItem('basicPassword', this.passwordCtrl.value);
    this.authzService.getPerunPrincipal().subscribe({
      next: (principal) => {
        sessionStorage.setItem('baPrincipal', JSON.stringify(principal));
        location.reload();
      },
      error: () => {
        this.wrongUsernameOrPassword = true;
      },
    });
  }
}
