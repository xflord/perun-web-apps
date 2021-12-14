import {
  Component,
  OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig} from '@perun-web-apps/perun/utils';
import { AddAuthImgDialogComponent } from '../../../components/dialogs/add-auth-img-dialog/add-auth-img-dialog.component';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { RemoveStringValueDialogComponent } from '../../../components/dialogs/remove-string-value-dialog/remove-string-value-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-settings-authentication',
  templateUrl: './settings-authentication.component.html',
  styleUrls: ['./settings-authentication.component.scss']
})
export class SettingsAuthenticationComponent implements OnInit {

  removeDialogTitle: string;
  imgAtt: Attribute;
  imageSrc = '';
  removeDialogDescription: string;
  mfaUrl = '';
  displayImageBlock: boolean;

  constructor(private dialog: MatDialog,
              private attributesManagerService: AttributesManagerService,
              private store: StoreService,
              private translate: TranslateService) {
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE').subscribe(res => this.removeDialogTitle = res);
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC').subscribe(res => this.removeDialogDescription = res);
  }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE').subscribe(res => this.removeDialogTitle = res);
      this.translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC').subscribe(res => this.removeDialogDescription = res);
      this.mfaUrl = this.store.get('mfa', 'url_'+this.translate.currentLang);
    });
    this.mfaUrl = this.store.get('mfa', 'url_'+this.translate.currentLang);
    this.loadImage();
  }

  onAddImg() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { theme: 'user-theme', attribute: this.imgAtt };

    const dialogRef = this.dialog.open(AddAuthImgDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImage();
      }
    });
  }

  // private transformTextToImg(text: string) {
  //   const canvas = document.createElement('canvas');
  //   const context = canvas.getContext('2d');
  //   context.font = "100px Calibri";
  //   context.fillText(text, 1, 70);
  //   return canvas.toDataURL('image/png');
  // }

  onDeleteImg() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      doNotShowValues: true,
      attribute: this.imgAtt,
      userId: this.store.getPerunPrincipal().userId,
      title: this.removeDialogTitle,
      description: this.removeDialogDescription
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe(sshAdded => {
      if (sshAdded) {
        this.loadImage();
      }
    });
  }

  private loadImage() {
    const imgAttributeName = this.store.get('mfa', 'security_image_attribute');
    this.displayImageBlock = this.store.get('mfa', 'enable_security_image');
    this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId, imgAttributeName).subscribe(attr => {
      if (!attr) {
        this.attributesManagerService.getAttributeDefinitionByName(imgAttributeName).subscribe(att => {
          this.imgAtt = att as Attribute;
        });
      } else {
        this.imgAtt = attr;
        this.imageSrc = this.imgAtt.value as unknown as string;
      }
    });
  }
}
