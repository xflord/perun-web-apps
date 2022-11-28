import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { AttributesManagerService, User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../../../shared/components/dialogs/edit-user-dialog/edit-user-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { AnonymizeUserDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'app-admin-user-detail-page',
  templateUrl: './admin-user-detail-page.component.html',
  styleUrls: ['./admin-user-detail-page.component.scss'],
})
export class AdminUserDetailPageComponent implements OnInit {
  user: User;
  loading = false;
  svgIcon = 'perun-user-dark';
  anonymized: boolean;
  private path: string;
  private regex: string;

  constructor(
    private route: ActivatedRoute,
    private attributesService: AttributesManagerService,
    private usersService: UsersManagerService,
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe((params) => {
      const userId = Number(params['userId']);
      this.entityStorageService.setEntity({ id: Number(userId), beanName: 'User' });

      this.path = `/admin/users/${userId}`;
      this.regex = `/admin/users/\\d+`;

      this.usersService.getUserById(userId).subscribe(
        (user) => {
          this.user = user;
          if (this.user.serviceUser) {
            this.svgIcon = 'perun-service-identity';
          }

          const userItem = this.sideMenuItemService.parseUser(user, this.path, this.regex);
          this.sideMenuService.setAdminItems([userItem]);
          this.loading = false;
        },
        () => (this.loading = false)
      );

      const anonymizedAttrName = 'urn:perun:user:attribute-def:virt:anonymized';
      this.attributesService
        .getAttribute(anonymizedAttrName, undefined, undefined, userId)
        .subscribe((attr) => {
          this.anonymized = Boolean(attr.value);
        });
    });
  }

  editUser(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'admin-theme',
      user: this.user,
    };

    const dialogRef = this.dialog.open(EditUserDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usersService.getUserById(this.user.id).subscribe((user) => {
          this.user = user;
        });
      }
    });
  }

  getUserType(): string {
    if (this.user.serviceUser) {
      return 'Service';
    }
    return 'Person';
  }

  anonymizeUser(): void {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      theme: 'admin-theme',
      user: this.user,
    };

    const dialogRef = this.dialog.open(AnonymizeUserDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        void this.router.navigate(['/admin', 'users'], { queryParamsHandling: 'merge' });
      }
    });
  }
}
