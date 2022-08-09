import { Component, Input } from '@angular/core';
import { User } from '@perun-web-apps/perun/openapi';
import { AuthService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
})
export class HeaderMenuComponent {
  @Input()
  user: User;
  @Input()
  iconColor: string;
  @Input()
  textColor: string;
  @Input()
  logoutEnabled: boolean;
  @Input()
  url: string;
  @Input()
  label: string;

  constructor(private authService: AuthService) {}

  redirectToUrl(): void {
    window.open(this.url, '_blank');
  }

  onLogOut(): void {
    this.authService.logout();
  }
}
