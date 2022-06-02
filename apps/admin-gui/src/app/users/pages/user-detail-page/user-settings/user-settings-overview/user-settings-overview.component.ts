import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { ActivatedRoute } from '@angular/router';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-user-settings-overview',
  templateUrl: './user-settings-overview.component.html',
  styleUrls: ['./user-settings-overview.component.scss'],
})
export class UserSettingsOverviewComponent implements OnInit {
  @HostBinding('class.router-component') true;
  navItems: MenuItem[] = [];
  path: string;
  isServiceUser: boolean;
  loading = false;

  constructor(private route: ActivatedRoute, private userManager: UsersManagerService) {}

  ngOnInit(): void {
    if (window.location.pathname.startsWith('/admin')) {
      this.loading = true;
      this.route.parent.parent.params.subscribe((params) => {
        const userId = Number(params['userId']);

        this.userManager.getUserById(userId).subscribe(
          (user) => {
            this.isServiceUser = user.serviceUser;
            this.initNavItems();
            this.loading = false;
          },
          () => (this.loading = false)
        );
      });
    } else {
      this.initNavItems();
    }
  }

  private initNavItems(): void {
    this.navItems = [];
    // if at user profile, add user gui config item
    if (!window.location.pathname.startsWith('/admin')) {
      this.navItems.push(
        {
          cssIcon: 'perun-settings2',
          url: 'passwordReset',
          label: 'MENU_ITEMS.USER.PASSWORD_RESET',
          style: 'user-btn',
        },
        {
          cssIcon: 'perun-settings1',
          url: 'guiConfig',
          label: 'MENU_ITEMS.USER.GUI_CONFIG',
          style: 'user-btn',
        }
      );
    }
  }
}
