import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddAuthImgDialogComponent } from '../../../components/dialogs/add-auth-img-dialog/add-auth-img-dialog.component';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import {
  NotificatorService,
  PerunTranslateService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { RemoveStringValueDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { AddAuthTextDialogComponent } from '../../../components/dialogs/add-auth-text-dialog/add-auth-text-dialog.component';

@Component({
  selector: 'perun-web-apps-settings-authentication',
  templateUrl: './settings-authentication.component.html',
  styleUrls: ['./settings-authentication.component.scss'],
})
export class SettingsAuthenticationComponent implements OnInit {
  @ViewChild('toggle') toggle: MatSlideToggle;

  imgAtt: Attribute;
  textAtt: Attribute;
  imageSrc = '';
  mfaUrl = '';
  displayImageBlock: boolean;
  displayTextBlock: boolean;
  loading = false;

  constructor(
    private dialog: MatDialog,
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private translate: PerunTranslateService,
    private notificatorService: NotificatorService
  ) {}

  ngOnInit(): void {
    const mfa = this.store.getProperty('mfa');

    this.translate.onLangChange.subscribe(() => {
      this.mfaUrl = this.translate.currentLang === 'en' ? mfa.url_en : mfa.url_cs;
    });

    this.mfaUrl = this.translate.currentLang === 'en' ? mfa.url_en : mfa.url_cs;
    this.displayImageBlock = this.store.getProperty('mfa').enable_security_image;
    if (this.displayImageBlock) {
      this.loadSecurityAttribute('image');
    }
    this.displayTextBlock = this.store.getProperty('mfa').enable_security_text;
    if (this.displayTextBlock) {
      this.loadSecurityAttribute('text');
    }
  }

  loadSecurityAttribute(mode: 'image' | 'text'): void {
    this.loading = true;
    const attributeName =
      mode === 'image'
        ? this.store.getProperty('mfa').security_image_attribute
        : this.store.getProperty('mfa').security_text_attribute;
    this.attributesManagerService
      .getUserAttributeByName(this.store.getPerunPrincipal().userId, attributeName)
      .subscribe({
        next: (attr) => {
          if (!attr) {
            this.attributesManagerService
              .getAttributeDefinitionByName(attributeName)
              .subscribe((att) => {
                if (mode === 'image') {
                  this.imgAtt = att as Attribute;
                } else {
                  this.textAtt = att as Attribute;
                }
              });
          } else {
            if (mode === 'image') {
              this.imgAtt = attr;
              this.imageSrc = this.imgAtt.value as string;
            } else {
              this.textAtt = attr;
            }
          }
          this.loading = false;
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
        },
      });
  }

  onAddAttribute(mode: 'image' | 'text'): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { theme: 'user-theme', attribute: mode === 'image' ? this.imgAtt : this.textAtt };

    const dialogRef: MatDialogRef<AddAuthImgDialogComponent | AddAuthTextDialogComponent> =
      mode === 'image'
        ? this.dialog.open(AddAuthImgDialogComponent, config)
        : this.dialog.open(AddAuthTextDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificatorService.showSuccess(
          this.translate.instant(`AUTHENTICATION.SAVE_${mode === 'image' ? 'IMG' : 'TEXT'}_SUCCESS`)
        );
        this.loadSecurityAttribute(mode);
      }
    });
  }

  onDeleteAttribute(mode: 'image' | 'text'): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';

    const attr: Attribute = mode === 'image' ? this.imgAtt : this.textAtt;
    const removeDialogTitle = this.translate.instant(
      `AUTHENTICATION.DELETE_${mode === 'image' ? 'IMG' : 'TEXT'}_DIALOG_TITLE`
    );
    const removeDialogDescription = this.translate.instant(
      `AUTHENTICATION.DELETE_${mode === 'image' ? 'IMG' : 'TEXT'}_DIALOG_DESC`
    );
    config.data = {
      doNotShowValues: true,
      attribute: attr,
      userId: this.store.getPerunPrincipal().userId,
      title: removeDialogTitle,
      description: removeDialogDescription,
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe((attrRemoved) => {
      if (attrRemoved) {
        this.notificatorService.showSuccess(
          this.translate.instant(
            `AUTHENTICATION.REMOVE_${mode === 'image' ? 'IMG' : 'TEXT'}_SUCCESS`
          )
        );
        this.loadSecurityAttribute('image');
      }
    });
  }

  redirectToMfa(): void {
    window.open(this.mfaUrl, '_blank');
  }
}
