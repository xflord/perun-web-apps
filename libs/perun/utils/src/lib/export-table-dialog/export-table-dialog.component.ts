import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Format {
  value: string;
  viewValue: string;
}

interface InputData {
  allowExportAll: boolean;
}

@Component({
  selector: 'perun-web-apps-export-table-dialog',
  templateUrl: './export-table-dialog.component.html',
  styleUrls: ['./export-table-dialog.component.scss'],
})
export class ExportTableDialogComponent {
  formats: Format[] = [{ value: 'csv', viewValue: 'CSV' }];
  selectedFormat = new FormControl<string>('csv', Validators.required);
  selectedExportType = new FormControl<string>('current', Validators.required);
  constructor(@Inject(MAT_DIALOG_DATA) public inputData: InputData) {}
  isValidSelection(): boolean {
    return this.selectedFormat.value !== null && this.selectedExportType.value !== null;
  }

  export(): { exportType: string; format: string } {
    return {
      exportType: this.selectedExportType.value,
      format: this.selectedFormat.value,
    };
  }
}
