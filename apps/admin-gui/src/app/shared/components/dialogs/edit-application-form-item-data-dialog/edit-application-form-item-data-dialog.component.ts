import { Component, Inject, OnInit } from '@angular/core';
import {
  ApplicationFormItem,
  ApplicationFormItemData,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';

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
  constructor(
    private dialogRef: MatDialogRef<EditApplicationFormItemDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EditApplicationFormItemDataDialogData,
    private notificator: NotificatorService,
    private translateService: TranslateService,
    private registrarService: RegistrarManagerService
  ) {}

  loading = false;
  theme: string;
  itemName: string;
  formItemData: ApplicationFormItemData;

  inputControl: FormControl = null;
  emailControl: FormControl = null;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.formItemData = this.data.formItemData;
    this.itemName = this.getLabel(this.formItemData.formItem);

    if (this.itemName.toLowerCase().includes('mail')) {
      this.emailControl = new FormControl(this.formItemData.value, [
        Validators.required,
        Validators.email,
      ]);
    } else {
      this.inputControl = new FormControl(this.formItemData.value, [Validators.required]);
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    this.formItemData.value =
      this.inputControl !== null ? this.inputControl.value : this.emailControl.value;

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
            this.translateService.instant('DIALOGS.EDIT_APPLICATION_FORM_ITEM_DATA.SUCCESS')
          );
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
  }

  getLabel(formItem: ApplicationFormItem) {
    if (formItem.i18n['en'].label !== null) {
      if (formItem.i18n['en'].label.length !== 0) {
        return formItem.i18n['en'].label;
      }
    }
    return formItem.shortname;
  }
}
