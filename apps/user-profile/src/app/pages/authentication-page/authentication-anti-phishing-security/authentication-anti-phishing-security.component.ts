import { Component, OnInit } from '@angular/core';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddAuthImgDialogComponent } from '../../../components/dialogs/add-auth-img-dialog/add-auth-img-dialog.component';
import { AddAuthTextDialogComponent } from '../../../components/dialogs/add-auth-text-dialog/add-auth-text-dialog.component';
import { RemoveStringValueDialogComponent } from '@perun-web-apps/perun/dialogs';
import {
  NotificatorService,
  PerunTranslateService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { Observable, Subject } from 'rxjs';
import { ComponentType } from '@angular/cdk/overlay';

@Component({
  selector: 'perun-web-apps-authentication-anti-phishing-security',
  templateUrl: './authentication-anti-phishing-security.component.html',
  styleUrls: ['./authentication-anti-phishing-security.component.scss'],
})
export class AuthenticationAntiPhishingSecurityComponent implements OnInit {
  imgAtt: Attribute;
  imgAttrName: string;
  imageSrc = '';
  textAtt: Attribute;
  textAttrName: string;
  componentMapper: {
    [key: string]: ComponentType<AddAuthImgDialogComponent | AddAuthTextDialogComponent>;
  };

  loading = false;

  displayImageBlock: boolean;
  displayTextBlock: boolean;

  constructor(
    private dialog: MatDialog,
    private attributesManagerService: AttributesManagerService,
    private store: StoreService,
    private translate: PerunTranslateService,
    private notificatorService: NotificatorService,
  ) {}

  ngOnInit(): void {
    this.imgAttrName = this.store.getProperty('mfa').security_image_attribute;
    this.textAttrName = this.store.getProperty('mfa').security_text_attribute;

    this.componentMapper = {
      AddAuthImgDialogComponent: AddAuthImgDialogComponent,
      AddAuthTextDialogComponent: AddAuthTextDialogComponent,
    };

    this.displayImageBlock = this.store.getProperty('mfa').enable_security_image;
    if (this.displayImageBlock) {
      this.loadSecurityAttribute(this.imgAttrName, true).subscribe((attr) => {
        this.imgAtt = attr;
      });
    }
    this.displayTextBlock = this.store.getProperty('mfa').enable_security_text;
    if (this.displayTextBlock) {
      this.loadSecurityAttribute(this.textAttrName).subscribe((attr) => {
        this.textAtt = attr;
      });
    }
  }

  loadSecurityAttribute(attributeName: string, saveImageSrc = false): Observable<Attribute> {
    this.loading = true;
    const subject = new Subject<Attribute>();
    this.attributesManagerService
      .getUserAttributeByName(this.store.getPerunPrincipal().userId, attributeName)
      .subscribe({
        next: (attr) => {
          if (!attr) {
            this.attributesManagerService
              .getAttributeDefinitionByName(attributeName)
              .subscribe((att) => {
                subject.next(att as Attribute);
              });
          } else {
            if (saveImageSrc) this.imageSrc = attr.value as string;
            subject.next(attr);
          }
          this.loading = false;
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
        },
      });
    return subject.asObservable();
  }

  onAddAttribute(
    attribute: Attribute,
    attributeName: string,
    dialogComponentName: 'AddAuthImgDialogComponent' | 'AddAuthTextDialogComponent',
    translation: string,
  ): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { theme: 'user-theme', attribute: attribute };

    const dialogRef: MatDialogRef<AddAuthImgDialogComponent | AddAuthTextDialogComponent> =
      this.dialog.open(this.componentMapper[dialogComponentName], config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificatorService.showSuccess(
          this.translate.instant(`AUTHENTICATION.SAVE_${translation}_SUCCESS`),
        );
        this.loadSecurityAttribute(attributeName, translation === 'IMG').subscribe((attr) => {
          attribute = attr;
        });
      }
    });
  }

  onDeleteAttribute(attribute: Attribute, attributeName: string, translation: string): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';

    const removeDialogTitle = this.translate.instant(
      `AUTHENTICATION.DELETE_${translation}_DIALOG_TITLE`,
    );
    const removeDialogDescription = this.translate.instant(
      `AUTHENTICATION.DELETE_${translation}_DIALOG_DESC`,
    );
    config.data = {
      doNotShowValues: true,
      attribute: attribute,
      userId: this.store.getPerunPrincipal().userId,
      title: removeDialogTitle,
      description: removeDialogDescription,
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe((attrRemoved) => {
      if (attrRemoved) {
        this.notificatorService.showSuccess(
          this.translate.instant(`AUTHENTICATION.REMOVE_${translation}_SUCCESS`),
        );
        this.loadSecurityAttribute(attributeName, translation === 'IMG').subscribe((attr) => {
          attribute = attr;
        });
      }
    });
  }
}
