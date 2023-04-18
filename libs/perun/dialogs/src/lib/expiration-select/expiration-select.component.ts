import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'perun-web-apps-expiration-select',
  templateUrl: './expiration-select.component.html',
  styleUrls: ['./expiration-select.component.css'],
})
export class ExpirationSelectComponent implements OnInit, OnChanges {
  @Input() expiration = 'never';
  @Input() allowNever = true;
  @Input() minDate: Date = null;
  @Input() maxDate: Date = null;
  @Output() datePicker: EventEmitter<string> = new EventEmitter<string>();
  expirationControl = new FormControl<string>(null);

  ngOnInit(): void {
    const defaultDate = this.maxDate ? this.maxDate : this.minDate;
    this.expirationControl.setValue(formatDate(defaultDate, 'yyyy-MM-dd', 'en-GB'));
  }

  ngOnChanges(): void {
    // Change selected date to be in [min, max] range
    const selectedExpiration = new Date(this.expirationControl.value);
    let validExpiration = selectedExpiration;
    if (this.minDate && selectedExpiration < this.minDate) {
      validExpiration = this.minDate;
    } else if (this.maxDate && selectedExpiration > this.maxDate) {
      validExpiration = this.maxDate;
    }

    this.expirationControl.setValue(formatDate(validExpiration, 'yyyy-MM-dd', 'en-GB'));
  }

  setExpiration(exp: MatDatepickerInputEvent<Date>): void {
    this.expiration = formatDate(exp.value, 'yyyy-MM-dd', 'en-GB');
    this.expirationControl.setValue(formatDate(exp.value, 'yyyy-MM-dd', 'en-GB'));

    this.emitDate();
  }

  emitDate(): void {
    if (this.expiration !== 'never' && this.expirationControl.value === '') {
      return;
    }

    this.datePicker.emit(this.expiration);
  }
}
