import { FormGroup, FormControl } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { openClose, tagsOpenClose } from '@perun-web-apps/perun/animations';
import {
  ApplicationMail,
  GroupsManagerService,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, StoreService, HtmlEscapeService } from '@perun-web-apps/perun/services';

export interface ApplicationFormAddEditMailDialogData {
  theme: string;
  voId: number;
  groupId: number;
  createMailNotification: boolean;
  applicationMail: ApplicationMail;
  applicationMails: ApplicationMail[];
}

@Component({
  selector: 'app-add-edit-notification-dialog',
  templateUrl: './add-edit-notification-dialog.component.html',
  styleUrls: ['./add-edit-notification-dialog.component.scss'],
  animations: [tagsOpenClose, openClose],
})
export class AddEditNotificationDialogComponent implements OnInit {
  applicationMail: ApplicationMail;
  showTags = false;
  isTextFocused = true;
  invalidNotification = false;
  loading = false;
  theme: string;
  editAuth: boolean;
  languages = ['en'];
  formats = ['plain', 'html'];
  htmlAuth: boolean;
  inputFormGroup: FormGroup<Record<string, FormControl<string>>> = null;

  constructor(
    private dialogRef: MatDialogRef<AddEditNotificationDialogComponent>,
    private registrarService: RegistrarManagerService,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationFormAddEditMailDialogData,
    private authResolver: GuiAuthResolver,
    private groupsService: GroupsManagerService,
    private store: StoreService,
    private inputEscape: HtmlEscapeService,
  ) {}

  ngOnInit(): void {
    this.languages = this.store.getProperty('supported_languages');
    // at this moment we want to enable the html notification settings just for Perun Admin
    this.htmlAuth = this.authResolver.isPerunAdmin();
    this.applicationMail = this.data.applicationMail;
    this.theme = this.data.theme;

    if (this.data.groupId) {
      this.groupsService.getGroupById(this.data.groupId).subscribe((group) => {
        this.editAuth = this.authResolver.isAuthorized(
          'group-addMail_ApplicationForm_ApplicationMail_policy',
          [group],
        );
      });
    } else if (this.data.voId) {
      const vo = {
        id: this.data.voId,
        beanName: 'Vo',
      };

      this.editAuth = this.authResolver.isAuthorized(
        'vo-addMail_ApplicationForm_ApplicationMail_policy',
        [vo],
      );
    }

    const formGroupFields: { [key: string]: FormControl<string> } = {};
    for (const lang of this.languages) {
      // Plain
      formGroupFields[`${lang}-plain-subject`] = new FormControl(
        this.applicationMail.message[lang].subject,
        [],
      );
      formGroupFields[`${lang}-plain-text`] = new FormControl(
        this.applicationMail.message[lang].text,
        [],
      );
      // Html
      formGroupFields[`${lang}-html-subject`] = new FormControl(
        this.applicationMail.htmlMessage[lang].subject,
        [this.inputEscape.htmlContentValidator()],
      );
      formGroupFields[`${lang}-html-text`] = new FormControl(
        this.applicationMail.htmlMessage[lang].text,
        [this.inputEscape.htmlContentValidator()],
      );
      formGroupFields[`${lang}-html-subject`].markAsTouched();
      formGroupFields[`${lang}-html-text`].markAsTouched();
    }
    this.inputFormGroup = new FormGroup(formGroupFields);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  create(): void {
    this.notificationExist();
    if (this.invalidNotification) {
      return;
    }
    this.loading = true;
    this.validateNotification();
    if (this.data.groupId) {
      this.registrarService
        .addApplicationMailForGroup({
          group: this.data.groupId,
          mail: this.applicationMail,
        })
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: () => (this.loading = false),
        });
    } else {
      this.registrarService
        .addApplicationMailForVo({
          vo: this.data.voId,
          mail: this.applicationMail,
        })
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: () => (this.loading = false),
        });
    }
  }

  save(): void {
    this.loading = true;
    this.validateNotification();
    this.registrarService.updateApplicationMail({ mail: this.applicationMail }).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => (this.loading = false),
    });
  }

  addTag(
    input: HTMLDivElement,
    textarea: HTMLDivElement,
    language: string,
    tag: string,
    format: string,
  ): void {
    const place: HTMLInputElement | HTMLTextAreaElement = this.isTextFocused
      ? (textarea.children.item(0) as HTMLTextAreaElement)
      : (input.children.item(0) as HTMLInputElement);
    const position: number = place.selectionStart;
    const form = this.inputFormGroup.get(
      `${language}-${format}-${this.isTextFocused ? 'text' : 'subject'}`,
    );
    const curValue = form.value;
    form.setValue(curValue.substring(0, position) + tag + curValue.substring(position));
    place.focus();
  }

  notificationExist(): void {
    for (const mail of this.data.applicationMails) {
      if (
        mail.mailType === this.applicationMail.mailType &&
        mail.appType === this.applicationMail.appType
      ) {
        this.invalidNotification = true;
        return;
      }
    }
    this.invalidNotification = false;
  }

  validateNotification(): void {
    // Validate notification
    for (const lang of this.languages) {
      let escaped = this.inputEscape.escapeDangerousHtml(
        this.inputFormGroup.get(`${lang}-html-subject`).value,
      );
      this.applicationMail.htmlMessage[lang].subject = escaped.escapedHtml;
      escaped = this.inputEscape.escapeDangerousHtml(
        this.inputFormGroup.get(`${lang}-html-text`).value,
      );
      this.applicationMail.htmlMessage[lang].text = escaped.escapedHtml;

      // Update application with content from FormControl
      this.applicationMail.message[lang].subject = this.inputFormGroup.get(
        `${lang}-plain-subject`,
      ).value;
      this.applicationMail.message[lang].text = this.inputFormGroup.get(`${lang}-plain-text`).value;
    }
  }
}
