import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Attribute } from '@perun-web-apps/perun/openapi';

export interface AttributeValueListEditDialogData {
  attribute: Attribute;
  index: number;
}

@Component({
  selector: 'perun-web-apps-attribute-value-list-edit-dialog',
  templateUrl: './attribute-value-list-edit-dialog.component.html',
  styleUrls: ['./attribute-value-list-edit-dialog.component.scss'],
})
export class AttributeValueListEditDialogComponent implements OnInit {
  attributeValue = '';

  constructor(
    public dialogRef: MatDialogRef<AttributeValueListEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AttributeValueListEditDialogData
  ) {}

  ngOnInit() {
    this.attributeValue = this.data.attribute.value[this.data.index];
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.data.attribute.value[this.data.index] = this.attributeValue;
    this.dialogRef.close(true);
  }
}
