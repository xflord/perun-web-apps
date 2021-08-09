import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';

export interface ApplicationFormEmailFooterDialogData {
  theme: string;
  voId: number;
  groupId: number;
}

@Component({
  selector: 'app-edit-email-footer-dialog',
  templateUrl: './edit-email-footer-dialog.component.html',
  styleUrls: ['./edit-email-footer-dialog.component.scss']
})
export class EditEmailFooterDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<EditEmailFooterDialogComponent>,
              private attributesManager: AttributesManagerService,
              private translateService: TranslateService,
              private notificator: NotificatorService,
              @Inject(MAT_DIALOG_DATA) public data: ApplicationFormEmailFooterDialogData) { }

  mailFooter = '';
  mailAttribute: Attribute;
  theme: string;
  loading = false;
  editAuth: boolean;

  ngOnInit() {
    this.theme = this.data.theme;
    this.loading = true;
    if(this.data.groupId) {
      this.getFooterForGroup();
    } else {
      this.getFooterForVo();
    }
    this.loading = false;
  }

  submit() {
    this.loading = true;
    // @ts-ignore
    this.mailAttribute.value = this.mailFooter;
    if (this.data.groupId) {
      this.attributesManager.setGroupAttribute({group: this.data.groupId, attribute: this.mailAttribute}).subscribe(() => {
        this.notificateSuccess();
        this.dialogRef.close();
      }, () => this.loading = false);
    } else {
      this.attributesManager.setVoAttribute({vo: this.data.voId, attribute: this.mailAttribute}).subscribe(() => {
        this.notificateSuccess();
        this.dialogRef.close();
      }, () => this.loading = false);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  getFooterForVo() {
    this.attributesManager.getVoAttributeByName(this.data.voId,
      Urns.VO_DEF_MAIL_FOOTER).subscribe( footer => {
      this.mailAttribute = footer;
      this.editAuth = this.mailAttribute.writable;
      if (footer.value) {
        // @ts-ignore
        this.mailFooter = footer.value;
      } else {
        this.mailFooter = '';
      }
    });
  }

  getFooterForGroup() {
    this.attributesManager.getGroupAttributeByName(this.data.groupId,
      Urns.GROUP_DEF_MAIL_FOOTER).subscribe(footer => {
      this.mailAttribute = footer;
      this.editAuth = this.mailAttribute.writable;
      if (footer.value) {
        // @ts-ignore
        this.mailFooter = footer.value;
      } else {
        this.mailFooter = '';
      }
    });
  }

  notificateSuccess() {
    this.translateService.get('DIALOGS.NOTIFICATIONS_EDIT_FOOTER.SUCCESS').subscribe( text => {
      this.notificator.showSuccess(text);
      this.dialogRef.close();
    });
  }
}
