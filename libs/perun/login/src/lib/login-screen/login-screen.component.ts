import { Component, OnInit } from '@angular/core';
import { AuthService } from '@perun-web-apps/perun/services';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss'],
})
export class LoginScreenComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigate(['/home']);
    }
  }
  startAuth(): void {
    this.auth.startAuthentication();
  }
}
