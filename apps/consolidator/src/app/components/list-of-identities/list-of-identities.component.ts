import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import { Attribute, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';
import { getAttribute } from '@perun-web-apps/perun/utils';
import { Urns } from '@perun-web-apps/perun/urns';

export interface TableInfo {
  name: string;
  value: string;
}

interface ProfileInfo {
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  nickname?: string;
  email?: string;
}
interface UserProfile {
  info: ProfileInfo;
}

@Component({
  selector: 'perun-web-apps-list-of-identities',
  templateUrl: './list-of-identities.component.html',
  styleUrls: ['./list-of-identities.component.css'],
})
export class ListOfIdentitiesComponent implements OnInit {
  idpProvider = '';
  logo: string;
  width: string;
  height: string;
  unknownIdentity: boolean;
  dataSource = new MatTableDataSource<TableInfo>();
  info: TableInfo[] = [];
  loading = false;

  constructor(
    private oauthService: OAuthService,
    private userService: UsersManagerService,
    private storeService: StoreService,
    private initService: InitAuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    void this.oauthService.loadUserProfile().then((userProfile: UserProfile) => {
      this.setIdpInfo(userProfile);
      void this.initService.simpleLoadPrincipal().then(() => {
        this.unknownIdentity = this.storeService.getPerunPrincipal().userId === -1;

        if (!this.unknownIdentity) {
          let linkedIdentities = '';
          this.userService
            .getRichUserExtSources(this.storeService.getPerunPrincipal().userId)
            .subscribe((userExtSources) => {
              userExtSources.forEach((ues) => {
                if (ues.attributes.length !== 0) {
                  const sourceIdpName: Attribute = getAttribute(
                    ues.attributes,
                    Urns.UES_SOURCE_IDP_NAME
                  );
                  if (sourceIdpName?.value) {
                    linkedIdentities += (sourceIdpName.value as string) + ', ';
                  }
                }
              });
              linkedIdentities = linkedIdentities.slice(0, -2);
              this.info.push({ name: 'Linked accounts', value: linkedIdentities });
              this.dataSource = new MatTableDataSource<TableInfo>(this.info);
              this.loading = false;
            });
        } else {
          this.dataSource = new MatTableDataSource<TableInfo>(this.info);
          this.loading = false;
        }
      });
    });
  }

  setIdpInfo(userProfile: UserProfile): void {
    const name = this.getUserName(userProfile);
    if (name !== null && name !== undefined && name !== '') {
      this.info.push({ name: 'Name', value: name });
    }
    const login = this.getUserLogin(userProfile);
    if (login !== null && login !== undefined && login !== '') {
      this.info.push({ name: 'Login', value: login });
    }
    if (userProfile.info.email) {
      this.info.push({ name: 'Email', value: userProfile.info.email });
    }

    this.idpProvider = this.getNestedItem(
      userProfile,
      this.storeService.getProperty('path_to_idp_provider_userinfo')
    );
    this.logo = this.getNestedItem(
      userProfile,
      this.storeService.getProperty('path_to_idp_logo_userinfo')
    );
    this.width = this.getNestedItem(
      userProfile,
      this.storeService.getProperty('path_to_idp_logo_width_userinfo')
    );
    this.height = this.getNestedItem(
      userProfile,
      this.storeService.getProperty('path_to_idp_logo_height_userinfo')
    );
  }

  getNestedItem(userProfile: UserProfile, path: string[]): string {
    let currentItem = userProfile.info as object;
    for (const segment of path) {
      currentItem = currentItem[segment] as object;
      if (Array.isArray(currentItem)) {
        currentItem = currentItem[0] as object;
      }
    }
    return String(currentItem);
  }

  getUserName(userProfile: UserProfile): string {
    const name = userProfile.info.name;
    if (name) {
      if (name !== '') {
        return name;
      }
    }
    const firstName = userProfile.info.given_name;
    const lastName = userProfile.info.family_name;
    if (firstName && lastName) {
      return firstName + ' ' + lastName;
    }
    return '';
  }

  getUserLogin(userProfile: UserProfile): string {
    const preferredUserName = userProfile.info.preferred_username;
    if (preferredUserName) {
      if (preferredUserName !== '') {
        return preferredUserName;
      }
    }
    const nickname = userProfile.info.nickname;
    if (nickname) {
      if (nickname !== '') {
        return nickname;
      }
    }
    return '';
  }
}
