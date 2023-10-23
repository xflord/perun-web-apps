import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, InitAuthService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-login-screen-service-access',
  templateUrl: './login-screen-service-access.component.html',
  styleUrls: ['./login-screen-service-access.component.css'],
})
export class LoginScreenServiceAccessComponent implements OnInit, AfterViewInit {
  usernameCtrl = new FormControl<string>(null, [Validators.required]);
  passwordCtrl = new FormControl<string>(null, [Validators.required]);
  wrongUsernameOrPassword = false;
  afterLogout: boolean;

  constructor(
    private authzService: AuthzResolverService,
    private auth: AuthService,
    private initAuth: InitAuthService,
    private router: Router,
  ) {}

  startAuth(): void {
    if (this.usernameCtrl.invalid || this.passwordCtrl.invalid) return;
    sessionStorage.removeItem('baAfterLogout');
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

  ngOnInit(): void {
    if (this.auth.isLoggedIn() || sessionStorage.getItem('baPrincipal')) {
      sessionStorage.removeItem('baAfterLogout');
      void this.router.navigate([''], { queryParamsHandling: 'merge' });
    }

    if (sessionStorage.getItem('baLogout')) {
      this.initAuth.invalidateServiceAccess();
      location.reload();
    }

    if (sessionStorage.getItem('baAfterLogout')) {
      this.afterLogout = true;
    }
  }

  ngAfterViewInit(): void {
    if (!sessionStorage.getItem('baLogout')) {
      sessionStorage.removeItem('baAfterLogout');
    }
  }
}
