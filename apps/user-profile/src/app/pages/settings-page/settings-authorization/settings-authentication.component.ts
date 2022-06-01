import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddAuthImgDialogComponent } from '../../../components/dialogs/add-auth-img-dialog/add-auth-img-dialog.component';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { AuthService, NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { RemoveStringValueDialogComponent } from '../../../components/dialogs/remove-string-value-dialog/remove-string-value-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'perun-web-apps-settings-authentication',
  templateUrl: './settings-authentication.component.html',
  styleUrls: ['./settings-authentication.component.scss'],
})
export class SettingsAuthenticationComponent implements OnInit, AfterViewInit {
  @ViewChild('toggle') toggle: MatSlideToggle;

  removeDialogTitle: string;
  imgAtt: Attribute;
  imageSrc = '';
  removeDialogDescription: string;
  mfaUrl = '';
  displayImageBlock: boolean;
  mfaAvailable = false;
  mfaApiUrl = '';
  loadingMfa = false;
  loadingImg = false;
  saveImgSuccess = '';
  removeImgSuccess = '';

  constructor(
    private dialog: MatDialog,
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private translate: TranslateService,
    private oauthService: OAuthService,
    private authService: AuthService,
    private notificatorService: NotificatorService
  ) {
    translate
      .get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE')
      .subscribe((res: string) => (this.removeDialogTitle = res));
    translate
      .get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC')
      .subscribe((res: string) => (this.removeDialogDescription = res));
    translate
      .get('AUTHENTICATION.SAVE_IMG_SUCCESS')
      .subscribe((res: string) => (this.saveImgSuccess = res));
    translate
      .get('AUTHENTICATION.REMOVE_IMG_SUCCESS')
      .subscribe((res: string) => (this.removeImgSuccess = res));
  }

  ngAfterViewInit(): void {
    this.toggle.change.subscribe((change) => {
      this.reAuthenticate(change.checked);
    });
  }

  ngOnInit(): void {
    this.loadingMfa = true;
    this.translate.onLangChange.subscribe(() => {
      this.translate
        .get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE')
        .subscribe((res: string) => (this.removeDialogTitle = res));
      this.translate
        .get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC')
        .subscribe((res: string) => (this.removeDialogDescription = res));
      this.mfaUrl = this.store.get('mfa', 'url_' + this.translate.currentLang) as string;
    });
    this.mfaUrl = this.store.get('mfa', 'url_' + this.translate.currentLang) as string;
    this.mfaApiUrl = this.store.get('mfa', 'api_url') as string;
    fetch(this.mfaApiUrl + 'mfaAvailable', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + this.oauthService.getIdToken() },
    })
      .then((response) => response.text())
      .then((responseText) => {
        this.mfaAvailable = responseText === 'true';
        if (this.mfaAvailable) {
          this.loadMfa();
        } else {
          this.loadingMfa = false;
        }
      })
      .catch((e) => {
        console.error(e);
        this.loadingMfa = false;
      });
    this.displayImageBlock = this.store.get('mfa', 'enable_security_image') as boolean;
    if (this.displayImageBlock) {
      this.loadImage();
    }
  }

  onAddImg(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { theme: 'user-theme', attribute: this.imgAtt };

    const dialogRef = this.dialog.open(AddAuthImgDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificatorService.showSuccess(this.saveImgSuccess);
        this.loadImage();
      }
    });
  }

  reAuthenticate(enforceMfa: boolean): void {
    sessionStorage.setItem('enforce_mfa', enforceMfa.toString());
    sessionStorage.setItem('mfa_route', '/profile/settings/auth');
    localStorage.removeItem('refresh_token');
    this.oauthService.logOut(true);
    sessionStorage.setItem('auth:redirect', location.pathname);
    sessionStorage.setItem('auth:queryParams', location.search.substring(1));
    this.authService.loadConfigData();
    void this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  enableMfa(value: boolean): Promise<Response> {
    const idToken = this.oauthService.getIdToken();
    const path = `mfaEnforced`;
    const url = `${this.mfaApiUrl}${path}`;
    const body = `value=${String(value)}`;

    return fetch(url, {
      method: 'PUT',
      body: body,
      headers: { Authorization: `Bearer ${idToken}` },
    });
  }

  onDeleteImg(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      doNotShowValues: true,
      attribute: this.imgAtt,
      userId: this.store.getPerunPrincipal().userId,
      title: this.removeDialogTitle,
      description: this.removeDialogDescription,
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe((imgRemoved) => {
      if (imgRemoved) {
        this.notificatorService.showSuccess(this.removeImgSuccess);
        this.loadImage();
      }
    });
  }

  redirectToMfa(): void {
    window.open(this.mfaUrl, '_blank');
  }

  private loadImage(): void {
    this.loadingImg = true;
    const imgAttributeName = this.store.get('mfa', 'security_image_attribute') as string;
    this.attributesManagerService
      .getUserAttributeByName(this.store.getPerunPrincipal().userId, imgAttributeName)
      .subscribe(
        (attr) => {
          if (!attr) {
            this.attributesManagerService
              .getAttributeDefinitionByName(imgAttributeName)
              .subscribe((att) => {
                this.imgAtt = att as Attribute;
              });
          } else {
            this.imgAtt = attr;
            this.imageSrc = this.imgAtt.value as string;
          }
          this.loadingImg = false;
        },
        (e) => {
          console.error(e);
          this.loadingImg = false;
        }
      );
  }

  private loadMfa(): void {
    const mfaRoute = sessionStorage.getItem('mfa_route');
    if (mfaRoute) {
      const enforceMfa = sessionStorage.getItem('enforce_mfa');
      this.enableMfa(enforceMfa === 'true')
        .then((res) => {
          if (res.ok && enforceMfa === 'true') {
            this.toggle.toggle();
          }
          this.loadingMfa = false;
        })
        .catch((e) => {
          console.error(e);
          this.loadingMfa = false;
        });
    } else {
      const enforceMfaAttributeName = this.store.get('mfa', 'enforce_mfa_attribute') as string;
      this.attributesManagerService
        .getUserAttributeByName(this.store.getPerunPrincipal().userId, enforceMfaAttributeName)
        .subscribe(
          (attr) => {
            if (attr.value) {
              this.toggle.toggle();
            }
            this.loadingMfa = false;
          },
          (e) => {
            console.error(e);
            this.loadingMfa = false;
          }
        );
    }
    if (sessionStorage.getItem('mfa_route')) {
      sessionStorage.removeItem('enforce_mfa');
      sessionStorage.removeItem('mfa_route');
    }
  }
}
