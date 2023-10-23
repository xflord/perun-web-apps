import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Application, MailType } from '@perun-web-apps/perun/openapi';

interface ApplicationsBulkOperationDialogData {
  theme: string;
  title: string;
  description: string;
  confirmButtonLabel: string;
  action: 'APPROVE' | 'REJECT' | 'DELETE' | 'RESEND';
  displayedColumns: string[];
  selectedApplications: Application[];
  allowGroupMailType: boolean;
  fedColumnsFriendly: string[];
  fedColumnsDisplay: string[];
}

@Component({
  selector: 'app-applications-bulk-operation-dialog',
  templateUrl: './applications-bulk-operation-dialog.component.html',
  styleUrls: ['./applications-bulk-operation-dialog.component.scss'],
})
export class ApplicationsBulkOperationDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  dataSource: MatTableDataSource<Application>;
  mailType: MailType = 'APP_CREATED_USER';
  reason = '';

  constructor(
    private dialogRef: MatDialogRef<ApplicationsBulkOperationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationsBulkOperationDialogData,
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data.selectedApplications);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  onConfirm(): void {
    if (this.data.action === 'RESEND') {
      this.dialogRef.close({ type: this.mailType, reason: this.reason });
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getFriendlyName(name: string): string {
    // FIXME duplication of 'application-dynamic-list'
    const index = name.lastIndexOf('/CN=');
    if (index !== -1) {
      const string = name.slice(index + 4, name.length).replace('/unstructuredName=', ' ');
      if (string.lastIndexOf('\\') !== -1) {
        return name.slice(name.lastIndexOf('=') + 1, name.length);
      }
      return string;
    }
    return name;
  }

  getFedValue(fedInfo: string, colName: string): string {
    // FIXME duplication of 'application-dynamic-list'
    // looking for values between {,FED_INFO_ATTR_NAME:}
    if (fedInfo === null || fedInfo.length === 0) {
      return '';
    }

    let values: string[] = [];
    if (fedInfo.startsWith(colName + ':')) {
      values = fedInfo.split(colName + ':');
    } else {
      values = fedInfo.split(',' + colName + ':');
    }
    if (values.length < 2) {
      return '';
    }
    // fedInfo should always end with comma - not escaped one though
    values[1] = values[1].replace(/\\,/gi, '#ESCAPED_COMMA');
    values = values[1].split(',');
    values[0] = values[0].replace('#ESCAPED_COMMA', '\\,');
    return this.deescapeMapEscapings(values[0]);
  }

  // Fedinfo characters that are being escaped: '\', ':' and ','
  deescapeMapEscapings(value: string): string {
    // FIXME duplication of 'application-dynamic-list'
    let newValue = value.replace(/\\:/gi, ':');
    newValue = newValue.replace(/\\,/gi, ',');
    newValue = newValue.replace(/\\\\/gi, '\\');
    return newValue;
  }
}
