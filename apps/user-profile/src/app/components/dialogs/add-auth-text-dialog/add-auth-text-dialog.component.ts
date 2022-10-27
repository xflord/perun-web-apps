import { Component, Inject, OnInit } from '@angular/core';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '@perun-web-apps/perun/services';

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

  onAdd(): void {
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

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
