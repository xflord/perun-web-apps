import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';

@Component({
  selector: 'perun-web-apps-year-range',
  templateUrl: './year-range.component.html',
  styleUrls: ['./year-range.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class YearRangeComponent implements OnInit {
  @Input() startYear: FormControl<Moment>;
  @Input() endYear: FormControl<Moment>;
  startMaxYear: Date;
  endMinYear: Date;
  endMaxYear: Date;

  ngOnInit(): void {
    this.endMaxYear = new Date();
    this.startMaxYear = this.endYear.value.toDate();
    this.startYear.setValue(null);
  }

  chosenYearHandler(
    dateFormControl: FormControl<Moment>,
    event: Moment,
    datepicker: MatDatepicker<Moment>
  ): void {
    dateFormControl.setValue(event);
    this.startMaxYear = this.endYear.value.toDate();
    this.endMinYear = this.startYear.value ? this.startYear.value.toDate() : null;
    datepicker.close();
  }
}
