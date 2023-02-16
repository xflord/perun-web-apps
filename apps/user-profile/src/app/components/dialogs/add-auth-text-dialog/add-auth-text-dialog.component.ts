import { Component, Inject, OnInit } from '@angular/core';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '@perun-web-apps/perun/services';
import words from './words.json';

export interface AddAuthTextDialogData {
  theme: string;
  attribute: Attribute;
}

@Component({
  selector: 'perun-web-apps-add-auth-text-dialog',
  templateUrl: './add-auth-text-dialog.component.html',
  styleUrls: ['./add-auth-text-dialog.component.scss'],
})
export class AddAuthTextDialogComponent implements OnInit {
  theme: string;
  attribute: Attribute;
  securityText = '';
  constructor(
    private dialogRef: MatDialogRef<AddAuthTextDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddAuthTextDialogData,
    private attributesManagerService: AttributesManagerService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.attribute = this.data.attribute;
    if (this.attribute.value) this.securityText = String(this.attribute.value);
  }

  add(): void {
    this.attribute.value = this.securityText;
    this.attributesManagerService
      .setUserAttribute({
        attribute: this.attribute,
        user: this.store.getPerunPrincipal().userId,
      })
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  generateText(locale = 'en'): void {
    const elements: string[] = words[locale] as string[];
    let result = elements[Math.floor(Math.random() * elements.length)];
    for (let i = 0; i < 3; i++) {
      result +=
        (locale !== 'emojis' ? '-' : ' ') + elements[Math.floor(Math.random() * elements.length)];
    }
    this.securityText = result;
  }
}
