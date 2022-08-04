import { Component, Inject, OnInit } from '@angular/core';
import {
  ApplicationFormItem,
  ApplicationFormItemData,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl, Validators } from '@angular/forms';

export interface EditApplicationFormItemDataDialogData {
  theme: string;
  applicationId: number;
  formItemData: ApplicationFormItemData;
}

@Component({
  selector: 'app-edit-application-form-item-data-dialog',
  templateUrl: './edit-application-form-item-data-dialog.component.html',
  styleUrls: ['./edit-application-form-item-data-dialog.component.scss'],
})
export class EditApplicationFormItemDataDialogComponent implements OnInit {
  loading = false;
  theme: string;
  itemName: string;
  inputControl: UntypedFormControl = null;
  emailControl: UntypedFormControl = null;
  private formItemData: ApplicationFormItemData;

  constructor(
    private dialogRef: MatDialogRef<EditApplicationFormItemDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EditApplicationFormItemDataDialogData,
    private notificator: NotificatorService,
    private translateService: TranslateService,
    private registrarService: RegistrarManagerService
  ) {}

  private static getLabel(formItem: ApplicationFormItem): string {
    if (formItem.i18n['en'].label !== null) {
      if (formItem.i18n['en'].label.length !== 0) {
        return formItem.i18n['en'].label;
      }
    }
    return formItem.shortname;
  }

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.formItemData = this.data.formItemData;
    this.itemName = EditApplicationFormItemDataDialogComponent.getLabel(this.formItemData.formItem);

    if (this.itemName.toLowerCase().includes('mail')) {
      this.emailControl = new UntypedFormControl(this.formItemData.value, [
        Validators.required,
        Validators.email,
      ]);
    } else {
      this.inputControl = new UntypedFormControl(this.formItemData.value, [Validators.required]);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.formItemData.value =
      this.inputControl !== null
        ? (this.inputControl.value as string)
        : (this.emailControl.value as string);

    const newFormItemData: ApplicationFormItemData = {
      id: this.formItemData.id,
      formItem: this.formItemData.formItem,
      shortname: this.formItemData.shortname,
      value: this.formItemData.value,
      assuranceLevel: this.formItemData.assuranceLevel,
      prefilledValue: this.formItemData.prefilledValue,
    };

    this.registrarService
      .updateFormItemData({
        appId: this.data.applicationId,
        data: newFormItemData,
      })
      .subscribe(
        () => {
          this.notificator.showSuccess(
            this.translateService.instant(
              'DIALOGS.EDIT_APPLICATION_FORM_ITEM_DATA.SUCCESS'
            ) as string
          );
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
  }
}
