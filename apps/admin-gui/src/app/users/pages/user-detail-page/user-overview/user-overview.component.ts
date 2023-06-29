import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import {
  Attribute,
  AttributesManagerService,
  User,
  UsersManagerService,
} from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { StoreService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig, parseAttributeFriendlyName } from '@perun-web-apps/perun/utils';
import { ChangeEmailDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrls: ['./user-overview.component.scss'],
})
export class UserOverviewComponent implements OnInit {
  @HostBinding('class.router-component') true;
  items: MenuItem[] = [];
  settingsItems: MenuItem[] = [];
  user: User;
  isServiceUser = false;
  userID: number;
  path: string;
  mailDataSource: MatTableDataSource<Attribute>;
  displayedColumns = ['name', 'value'];
  inMyProfile = false;
  preferredMail: Attribute;

  constructor(
    private userService: UsersManagerService,
    private attributeService: AttributesManagerService,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['userId']) {
        this.userService.getUserById(Number(params['userId'])).subscribe((user) => {
          this.user = user;
          this.isServiceUser = user.serviceUser;
          this.setItems(`/admin/users/${this.user.id}`);
          this.setSettingsItems();
        });
      } else {
        this.inMyProfile = true;
        this.userID = this.storeService.getPerunPrincipal().user.id;

        this.attributeService
          .getUserAttributeByName(this.userID, Urns.USER_DEF_PREFERRED_MAIL)
          .subscribe((mail) => {
            this.preferredMail = mail;
            this.handleMailNotDefined();

            this.mailDataSource = new MatTableDataSource<Attribute>([this.preferredMail]);
            this.setItems('/myProfile');
            this.setSettingsItems();
          });
      }
    });
  }

  changeEmail(): void {
    const config = getDefaultDialogConfig();
    config.width = '350px';
    config.data = { userId: this.userID };

    const dialogRef = this.dialog.open(ChangeEmailDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.attributeService
          .getUserAttributeByName(this.userID, Urns.USER_DEF_PREFERRED_MAIL)
          .subscribe((email) => {
            this.preferredMail = email;
            this.handleMailNotDefined();

            this.mailDataSource = new MatTableDataSource<Attribute>([this.preferredMail]);
          });
      }
    });
  }

  handleMailNotDefined(): void {
    if (this.preferredMail === null || this.preferredMail === undefined) {
      this.preferredMail = {
        id: -1,
        beanName: 'Attribute',
        displayName: parseAttributeFriendlyName(Urns.USER_DEF_PREFERRED_MAIL.split(':').pop()),
        value: new Object('-'),
      };
    }
  }

  private setItems(urlStart: string): void {
    this.items = [
      {
        cssIcon: 'perun-vo',
        url: `${urlStart}/organizations`,
        label: 'MENU_ITEMS.ADMIN.ORGANIZATIONS',
        style: 'user-btn',
      },
      {
        cssIcon: 'perun-group',
        url: `${urlStart}/groups`,
        label: 'MENU_ITEMS.ADMIN.GROUPS',
        style: 'user-btn',
      },
    ];
    if (!this.inMyProfile) {
      this.items.push(
        {
          cssIcon: 'perun-user',
          url: `${urlStart}/accounts`,
          label: 'MENU_ITEMS.USER.ACCOUNTS',
          style: 'user-btn',
        },
        {
          cssIcon: 'perun-identity',
          url: `${urlStart}/identities`,
          label: 'MENU_ITEMS.USER.IDENTITIES',
          style: 'user-btn',
        },
        {
          cssIcon: 'perun-facility-white',
          url: `${urlStart}/facilities`,
          label: 'MENU_ITEMS.USER.FACILITIES',
          style: 'user-btn',
        },
        {
          cssIcon: 'perun-resource',
          url: `${urlStart}/resources`,
          label: 'MENU_ITEMS.USER.RESOURCES',
          style: 'user-btn',
        }
      );
    }
    this.items.push({
      cssIcon: 'perun-attributes',
      url: `${urlStart}/attributes`,
      label: 'MENU_ITEMS.USER.ATTRIBUTES',
      style: 'user-btn',
    });
    this.items.push({
      cssIcon: 'perun-roles',
      url: `${urlStart}/roles`,
      label: 'MENU_ITEMS.USER.ROLES',
      style: 'user-btn',
    });
    if (this.isServiceUser) {
      this.items.push({
        cssIcon: 'perun-manager',
        url: `${urlStart}/associated-users`,
        label: 'MENU_ITEMS.USER.ASSOCIATED_USERS',
        style: 'user-btn',
      });
    } else {
      this.items.push({
        cssIcon: 'perun-service-identity',
        url: `${urlStart}/service-identities`,
        label: 'MENU_ITEMS.USER.SERVICE_IDENTITIES',
        style: 'user-btn',
      });
    }
    this.items.push({
      cssIcon: 'perun-ban',
      url: `bans`,
      label: 'MENU_ITEMS.USER.BANS',
      style: 'user-btn',
    });
  }

  private setSettingsItems(): void {
    this.settingsItems = [];
    if (this.inMyProfile) {
      this.settingsItems.push(
        {
          cssIcon: 'perun-settings2',
          url: '/myProfile/settings/passwordReset',
          label: 'MENU_ITEMS.USER.PASSWORD_RESET',
          style: 'user-btn',
        },
        {
          cssIcon: 'perun-settings1',
          url: '/myProfile/settings/guiConfig',
          label: 'MENU_ITEMS.USER.GUI_CONFIG',
          style: 'user-btn',
        }
      );
    }
  }
}
