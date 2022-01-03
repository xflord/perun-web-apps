import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../../../../core/services/common/side-menu.service';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { ActivatedRoute } from '@angular/router';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { SideMenuItemService } from '../../../../../../shared/side-menu/side-menu-item.service';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { EditUserDialogComponent } from '../../../../../../shared/components/dialogs/edit-user-dialog/edit-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-service-identity-detail-page',
  templateUrl: './service-identity-detail-page.component.html',
  styleUrls: ['./service-identity-detail-page.component.css']
})
export class ServiceIdentityDetailPageComponent implements OnInit {

  constructor(
    private sideMenuService: SideMenuService,
    private usersService: UsersManagerService,
    private sideMenuItemService: SideMenuItemService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {
  }

  user: User;
  loading = false;


  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const userId = params['userId'];
      this.entityStorageService.setEntity({id: Number(userId), beanName: 'User'});

      this.usersService.getUserById(userId).subscribe(user => {
        this.user = user;

        const userItem = this.sideMenuItemService.parseServiceIdentity(user);
        this.sideMenuService.setUserItems([userItem]);
        this.loading = false;
      }, () => this.loading = false);
    });
  }

  getUserType(){
    if (this.user.serviceUser){
      return "Service";
    }
    return "Person";
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
}
