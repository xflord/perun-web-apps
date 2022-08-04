import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { formatDate } from '@angular/common';

@Component({
  selector: 'perun-web-apps-change-expiration-dialog',
  templateUrl: './change-expiration-dialog.component.html',
  styleUrls: ['./change-expiration-dialog.component.scss'],
})
export class ChangeExpirationDialogComponent implements OnInit {
  @Input()
  currentExpiration: string;
  @Input()
  newExpiration: string;
  @Input()
  canExtendMembership = false;
  @Input()
  minDate: Date;
  @Input()
  maxDate: Date;
  @Input()
  mode: 'group' | 'vo' | 'sponsor';
  @Input()
  status: string;
  @Output()
  expirationChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  statusChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  successMessage: string;
  expirationControl: UntypedFormControl = new UntypedFormControl(null);
  currentDate: string;

  constructor(private dialogRef: MatDialogRef<ChangeExpirationDialogComponent>) {}

  ngOnInit(): void {
    const today = new Date();
    this.currentDate = formatDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      'yyyy-MM-dd',
      'en_US'
    );
    if (this.newExpiration !== 'never') {
      this.expirationControl.setValue(this.newExpiration);
    }
  }

  parseDate(value: string): string {
    return formatDate(value, 'yyyy-MM-dd', 'en_US');
  }

  onChange(): void {
    if (
      this.status === 'EXPIRED' &&
      (this.newExpiration === 'never' ||
        this.parseDate(this.expirationControl.value as string) > this.currentDate)
    ) {
      this.statusChange.emit(true);
    }
    this.expirationChanged.emit(this.newExpiration);
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  setExpiration(): void {
    this.newExpiration = formatDate(this.expirationControl.value as Date, 'yyyy-MM-dd', 'en');
    this.expirationControl.setValue(
      formatDate(this.expirationControl.value as Date, 'yyyy-MM-dd', 'en')
    );
  }
}
