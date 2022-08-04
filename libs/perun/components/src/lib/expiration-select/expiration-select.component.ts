import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'perun-web-apps-expiration-select',
  templateUrl: './expiration-select.component.html',
  styleUrls: ['./expiration-select.component.css'],
})
export class ExpirationSelectComponent implements OnInit {
  @Input() expiration = 'never';
  @Output() datePicker: EventEmitter<string> = new EventEmitter<string>();
  expirationControl = new UntypedFormControl(null);
  minDate: Date;

  ngOnInit(): void {
    const currentDate = new Date();
    this.minDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    this.expirationControl.setValue(formatDate(this.minDate, 'yyyy-MM-dd', 'en-GB'));
  }

  setExpiration(): void {
    this.expiration = formatDate(this.expirationControl.value as Date, 'yyyy-MM-dd', 'en-GB');
    this.expirationControl.setValue(
      formatDate(this.expirationControl.value as Date, 'yyyy-MM-dd', 'en-GB')
    );

    this.emitDate();
  }

  emitDate(): void {
    if (this.expiration !== 'never' && this.expirationControl.value === '') {
      return;
    }

    this.datePicker.emit(this.expiration);
  }
}
