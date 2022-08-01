import { Component, OnInit, ViewChild } from '@angular/core';
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
export class SettingsAuthenticationComponent implements OnInit {
  @ViewChild('toggle') toggle: MatSlideToggle;

  removeDialogTitle: string;
  imgAtt: Attribute;
  imageSrc = '';
  removeDialogDescription: string;
  mfaUrl = '';
  displayImageBlock: boolean;
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

  ngOnInit(): void {
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
    this.displayImageBlock = this.store.get('mfa', 'enable_security_image') as boolean;
    if (this.displayImageBlock) {
      this.loadImage();
    }
  }

  loadImage(): void {
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
}
