import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
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
  styleUrls: ['./edit-email-footer-dialog.component.scss'],
})
export class EditEmailFooterDialogComponent implements OnInit {
  mailFooter = '';
  htmlMailFooter = '';
  theme: string;
  loading = false;
  plainEdithAuth: boolean;
  htmlEditAuth: boolean;
  formats = ['plain_text', 'html'];
  private mailAttribute: Attribute;
  private htmlMailAttribute: Attribute;

  constructor(
    private dialogRef: MatDialogRef<EditEmailFooterDialogComponent>,
    private attributesManager: AttributesManagerService,
    private translateService: TranslateService,
    private notificator: NotificatorService,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationFormEmailFooterDialogData
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.loading = true;
    if (this.data.groupId) {
      this.getFooterForGroup();
    } else {
      this.getFooterForVo();
    }
    this.loading = false;
  }

  submit(): void {
    this.loading = true;
    this.mailAttribute.value = this.mailFooter;
    this.htmlMailAttribute.value = this.htmlMailFooter;
    if (this.data.groupId) {
      this.attributesManager
        .setGroupAttribute({ group: this.data.groupId, attribute: this.mailAttribute })
        .subscribe({
          next: () => {
            if (this.htmlEditAuth) {
              this.attributesManager
                .setGroupAttribute({ group: this.data.groupId, attribute: this.htmlMailAttribute })
                .subscribe({
                  next: () => {
                    this.notificationSuccess();
                    this.dialogRef.close();
                  },
                  error: () => (this.loading = false),
                });
            }
          },
          error: () => (this.loading = false),
        });
    } else {
      this.attributesManager
        .setVoAttribute({ vo: this.data.voId, attribute: this.mailAttribute })
        .subscribe({
          next: () => {
            if (this.htmlEditAuth) {
              this.attributesManager
                .setVoAttribute({ vo: this.data.voId, attribute: this.htmlMailAttribute })
                .subscribe({
                  next: () => {
                    this.notificationSuccess();
                    this.dialogRef.close();
                  },
                  error: () => (this.loading = false),
                });
            }
          },
          error: () => (this.loading = false),
        });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private getFooterForVo(): void {
    this.attributesManager
      .getVoAttributeByName(this.data.voId, Urns.VO_DEF_MAIL_FOOTER)
      .subscribe((footer) => {
        this.mailAttribute = footer;
        this.plainEdithAuth = this.mailAttribute.writable;
        if (footer.value) {
          this.mailFooter = footer.value as string;
        } else {
          this.mailFooter = '';
        }
      });
    this.attributesManager
      .getVoAttributeByName(this.data.voId, Urns.VO_DEF_MAIL_HTML_FOOTER)
      .subscribe((footer) => {
        this.htmlMailAttribute = footer;
        this.htmlEditAuth = this.htmlMailAttribute.writable;
        if (footer.value) {
          this.htmlMailFooter = footer.value as string;
        } else {
          this.htmlMailFooter = '';
        }
      });
  }

  private getFooterForGroup(): void {
    this.attributesManager
      .getGroupAttributeByName(this.data.groupId, Urns.GROUP_DEF_MAIL_FOOTER)
      .subscribe((footer) => {
        this.mailAttribute = footer;
        this.plainEdithAuth = this.mailAttribute.writable;
        if (footer.value) {
          this.mailFooter = footer.value as string;
        } else {
          this.mailFooter = '';
        }
      });
    this.attributesManager
      .getGroupAttributeByName(this.data.groupId, Urns.GROUP_DEF_MAIL_HTML_FOOTER)
      .subscribe((footer) => {
        this.htmlMailAttribute = footer;
        this.htmlEditAuth = this.htmlMailAttribute.writable;
        if (footer.value) {
          this.htmlMailFooter = footer.value as string;
        } else {
          this.htmlMailFooter = '';
        }
      });
  }

  private notificationSuccess(): void {
    this.translateService
      .get('DIALOGS.NOTIFICATIONS_EDIT_FOOTER.SUCCESS')
      .subscribe((text: string) => {
        this.notificator.showSuccess(text);
        this.dialogRef.close();
      });
  }
}
