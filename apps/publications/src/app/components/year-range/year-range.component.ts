import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'perun-web-apps-year-range',
  templateUrl: './year-range.component.html',
  styleUrls: ['./year-range.component.scss'],
})
export class YearRangeComponent implements OnInit {
  @Input() startYear: UntypedFormControl;
  @Input() endYear: UntypedFormControl;
  startMaxYear: Date;
  endMinYear: Date;
  endMaxYear: Date;

  ngOnInit(): void {
    this.endMaxYear = new Date();
    this.startMaxYear = this.endYear.value as Date;
    this.endMinYear = this.startYear.value as Date;
  }

  chosenYearHandler(
    dateFormControl: UntypedFormControl,
    event: UntypedFormControl,
    datepicker: MatDatepicker<Date>
  ): void {
    dateFormControl.setValue(event);
    this.startMaxYear = this.endYear.value as Date;
    this.endMinYear = this.startYear.value as Date;
    datepicker.close();
  }
}
