import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
})
export class DateRangeComponent implements OnInit {
  @Input() startDate: UntypedFormControl;
  @Input() endDate: UntypedFormControl;
  @Output() datePicker: EventEmitter<string> = new EventEmitter<string>();
  startMinDate: Date;
  startMaxDate: Date;
  endMinDate: Date;
  endMaxDate: Date;

  ngOnInit(): void {
    this.startMinDate = new Date(2000, 0, 1);
    this.endMaxDate = new Date();
    this.startMaxDate = this.endDate.value as Date;
    this.endMinDate = this.startDate.value as Date;
  }

  dateChange(): void {
    this.datePicker.emit();
    this.startMaxDate = this.endDate.value as Date;
    this.endMinDate = this.startDate.value as Date;
  }
}
