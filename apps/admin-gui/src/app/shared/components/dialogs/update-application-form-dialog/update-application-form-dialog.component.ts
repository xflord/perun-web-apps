import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationForm, RegistrarManagerService } from '@perun-web-apps/perun/openapi';
import { FormControl, FormArray, Validators } from '@angular/forms';

export interface UpdateApplicationFormDialogData {
  entity: string;
  applicationForm: ApplicationForm;
  theme: string;
  autoRegistrationEnabled: boolean;
}

@Component({
  selector: 'app-update-application-form-dialog',
  templateUrl: './update-application-form-dialog.component.html',
  styleUrls: ['./update-application-form-dialog.component.scss'],
})
export class UpdateApplicationFormDialogComponent implements OnInit {
  entity: string;
  applicationForm: ApplicationForm;
  initialState: string;
  extensionState: string;
  embeddedState: string;
  loading = false;
  theme: string;
  autoRegistrationEnabled: boolean;
  formArray: FormArray<FormControl<string>>;

  constructor(
    private dialogRef: MatDialogRef<UpdateApplicationFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: UpdateApplicationFormDialogData,
    private registrarManager: RegistrarManagerService,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.applicationForm = this.data.applicationForm;
    this.formArray = new FormArray<FormControl<string>>([]);
    for (const moduleName of this.applicationForm.moduleClassNames) {
      this.addModule(moduleName);
    }
    if (this.formArray.length === 0) {
      this.addModule();
    }
    this.initialState = this.applicationForm.automaticApproval ? 'auto' : 'manual';
    this.extensionState = this.applicationForm.automaticApprovalExtension ? 'auto' : 'manual';
    this.embeddedState = this.applicationForm.automaticApprovalEmbedded ? 'auto' : 'manual';
    this.entity = this.data.entity;
    this.autoRegistrationEnabled = this.data.autoRegistrationEnabled;
  }

  addModule(name = ''): void {
    const commaControl = new FormControl(name, {
      validators: [Validators.pattern(/^[^,]*$/)],
      updateOn: 'change',
    });
    commaControl.markAsTouched(); // This helps show the mat-error message immediately when a comma is typed
    this.formArray.push(commaControl);
  }

  removeModule(index: number): void {
    this.formArray.removeAt(index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.loading = true;
    const moduleNamesWithoutEmptyStrings: string[] = this.formArray.controls
      .map((control) => control.value)
      .filter((name: string) => name.trim() !== '');
    this.applicationForm.moduleClassNames = moduleNamesWithoutEmptyStrings;
    this.applicationForm.automaticApproval = this.initialState === 'auto';
    this.applicationForm.automaticApprovalExtension = this.extensionState === 'auto';
    this.applicationForm.automaticApprovalEmbedded = this.embeddedState === 'auto';
    this.registrarManager.updateForm({ form: this.applicationForm }).subscribe(
      (updatedForm) => {
        this.dialogRef.close(updatedForm);
      },
      () => (this.loading = false),
    );
  }
}
