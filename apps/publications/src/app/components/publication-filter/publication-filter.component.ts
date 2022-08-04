import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CabinetManagerService, Category } from '@perun-web-apps/perun/openapi';
import { UntypedFormControl } from '@angular/forms';
import * as _moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { formatDate } from '@angular/common';

const moment = _moment;

export const YEAR_MODE_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export interface FilterPublication {
  title: string;
  isbnissn: string;
  doi: string;
  category: number;
  startYear: string;
  endYear: string;
}

@Component({
  selector: 'perun-web-apps-publication-filter',
  templateUrl: './publication-filter.component.html',
  styleUrls: ['./publication-filter.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS },
  ],
})
export class PublicationFilterComponent implements OnInit {
  @Output() filteredPublication: EventEmitter<FilterPublication> =
    new EventEmitter<FilterPublication>();
  categories: Category[];
  title = new UntypedFormControl();
  code = new UntypedFormControl();
  selectedMode: string;
  selectedCategory: Category | 'no_value';
  startYear = new UntypedFormControl(moment());
  endYear = new UntypedFormControl(moment());

  constructor(private cabinetService: CabinetManagerService) {}

  ngOnInit(): void {
    this.title.setValue('');
    this.code.setValue('');
    this.selectedCategory = 'no_value';
    this.cabinetService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.selectedMode = 'isbn/issn';
    });
  }

  filter(): void {
    const code = this.code.value as string;
    const filter = {
      title: this.title.value as string,
      isbnissn: this.selectedMode === 'isbn/issn' ? code : null,
      doi: this.selectedMode === 'doi' ? code : null,
      category: this.selectedCategory !== 'no_value' ? this.selectedCategory.id : null,
      startYear: formatDate(this.startYear.value as Date, 'yyyy', 'en-GB'),
      endYear: formatDate(this.endYear.value as Date, 'yyyy', 'en-GB'),
    };
    this.filteredPublication.emit(filter);
  }

  clearFilter(): void {
    this.title.setValue('');
    this.code.setValue('');
    this.selectedMode = 'isbn/issn';
    this.selectedCategory = 'no_value';
    this.startYear = new UntypedFormControl(moment());
    this.endYear = new UntypedFormControl(moment());
    const filter = {
      title: null,
      isbnissn: null,
      doi: null,
      category: null,
      startYear: null,
      endYear: null,
    };
    this.filteredPublication.emit(filter);
  }
}
