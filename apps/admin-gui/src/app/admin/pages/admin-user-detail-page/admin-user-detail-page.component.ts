import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SideMenuService} from '../../../core/services/common/side-menu.service';
import {SideMenuItemService} from '../../../shared/side-menu/side-menu-item.service';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../../../shared/components/dialogs/edit-user-dialog/edit-user-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-admin-user-detail-page',
  templateUrl: './admin-user-detail-page.component.html',
  styleUrls: ['./admin-user-detail-page.component.scss']
})
export class AdminUserDetailPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersManagerService,
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) { }

  user: User;
  path: string;
  regex: string;
  loading = false;
  svgIcon = 'perun-user-dark';

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const userId = params['userId'];
      this.entityStorageService.setEntity({id: userId, beanName: 'User'});

      this.path = `/admin/users/${userId}`;
      this.regex = `/admin/users/\\d+`;

      this.usersService.getUserById(userId).subscribe(user => {
        this.user = user;
        if(this.user.serviceUser) {
          this.svgIcon = 'perun-service-identity';
        }

        const userItem = this.sideMenuItemService.parseUser(user, this.path, this.regex);
        this.sideMenuService.setAdminItems([userItem]);
        this.loading = false;
      }, () => this.loading = false);
    });
  }

  editUser() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'admin-theme',
      user: this.user
    };

    const dialogRef = this.dialog.open(EditUserDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.getUserById(this.user.id).subscribe(user => {
          this.user = user;
        });
      }
    });

  }

  getUserType(){
    if (this.user.serviceUser){
      return "Service";
    }
    return "Person";
  }
}
