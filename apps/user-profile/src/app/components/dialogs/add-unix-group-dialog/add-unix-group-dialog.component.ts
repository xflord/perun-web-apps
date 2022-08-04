import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { UntypedFormControl, Validators } from '@angular/forms';

export interface AddUnixGroupDialogData {
  userId: number;
  namespace: string;
  groups: string[];
}

@Component({
  selector: 'perun-web-apps-add-unix-group-dialog',
  templateUrl: './add-unix-group-dialog.component.html',
  styleUrls: ['./add-unix-group-dialog.component.scss'],
})
export class AddUnixGroupDialogComponent implements OnInit {
  inputControl: UntypedFormControl;
  loading: boolean;
  groups: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddUnixGroupDialogData>,
    @Inject(MAT_DIALOG_DATA) private data: AddUnixGroupDialogData,
    private attributesManagerService: AttributesManagerService
  ) {}

  ngOnInit(): void {
    this.inputControl = new UntypedFormControl(null, Validators.required);
    this.groups = this.data.groups;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.attributesManagerService
      .getUserAttributeByName(
        this.data.userId,
        `urn:perun:user:attribute-def:def:preferredUnixGroupName-namespace:${this.data.namespace}`
      )
      .subscribe((attribute) => {
        const groups: string[] = (attribute?.value as string[]) ?? [];
        groups.push(this.inputControl.value as string);
        attribute.value = groups;

        this.attributesManagerService
          .setUserAttribute({ user: this.data.userId, attribute: attribute })
          .subscribe(() => {
            this.loading = false;
            this.dialogRef.close(true);
          });
      });
  }
}
