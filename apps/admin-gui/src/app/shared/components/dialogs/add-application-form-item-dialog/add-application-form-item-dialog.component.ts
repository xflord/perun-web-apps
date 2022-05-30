import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { ApplicationFormItem, Type } from '@perun-web-apps/perun/openapi';
import { createNewApplicationFormItem } from '@perun-web-apps/perun/utils';
import { FormControl, Validators } from '@angular/forms';

export interface AddApplicationFormItemDialogComponentData {
  applicationFormItems: ApplicationFormItem[];
  fakeId: number;
}

@Component({
  selector: 'app-add-application-form-item-dialog',
  templateUrl: './add-application-form-item-dialog.component.html',
  styleUrls: ['./add-application-form-item-dialog.component.scss'],
})
export class AddApplicationFormItemDialogComponent implements OnInit {
  languages = this.store.get('supported_languages') as string[];

  items: string[] = [];
  selectedItem: string;
  selectedWidget: Type = 'HEADING';
  widgets: Type[] = [
    'HEADING',
    'HTML_COMMENT',
    'TEXTFIELD',
    'VALIDATED_EMAIL',
    'USERNAME',
    'PASSWORD',
    'SELECTIONBOX',
    'TEXTAREA',
    'COMBOBOX',
    'CHECKBOX',
    'SUBMIT_BUTTON',
    'RADIO',
    'TIMEZONE',
    'AUTO_SUBMIT_BUTTON',
    'EMBEDDED_GROUP_APPLICATION',
    'LIST_INPUT_BOX',
    'MAP_INPUT_BOX',
  ];
  nameCtrl: FormControl;

  constructor(
    private dialogRef: MatDialogRef<AddApplicationFormItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddApplicationFormItemDialogComponentData,
    private translateService: TranslateService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.translateService
      .get('DIALOGS.APPLICATION_FORM_ADD_ITEM.INSERT_TO_BEGINNING')
      .subscribe((text: string) => {
        this.nameCtrl = new FormControl('', [
          Validators.required,
          Validators.pattern('.*[\\S]+.*'),
          Validators.maxLength(129),
        ]);
        this.nameCtrl.markAllAsTouched();
        this.items.push(text);
        for (const item of this.data.applicationFormItems) {
          this.items.push(item.shortname);
          if (item.type === Type.EMBEDDED_GROUP_APPLICATION) {
            this.widgets = this.widgets.filter((type) => type !== Type.EMBEDDED_GROUP_APPLICATION);
          }
        }
        this.selectedItem = text;
      });
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  submit(): void {
    const item = this.createApplicationItem();
    this.dialogRef.close([this.data.applicationFormItems, item]);
  }

  createApplicationItem(): ApplicationFormItem {
    const newApplicationItem = createNewApplicationFormItem(this.languages);
    newApplicationItem.id = this.data.fakeId;
    newApplicationItem.shortname = this.nameCtrl.value as string;
    newApplicationItem.type = this.selectedWidget;
    for (let i = 0; i < this.items.length; i++) {
      if (this.selectedItem === this.items[i]) {
        this.data.applicationFormItems.splice(i, 0, newApplicationItem);
        return newApplicationItem;
      }
    }
  }
}
