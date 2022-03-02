import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-not-authorized-page',
  templateUrl: './not-authorized-page.component.html',
  styleUrls: ['./not-authorized-page.component.scss'],
})
export class NotAuthorizedPageComponent {
  constructor(private router: Router) {}

  redirectToHome(): void {
    void this.router.navigate(['/home'], { queryParamsHandling: 'merge' });
  }
}
