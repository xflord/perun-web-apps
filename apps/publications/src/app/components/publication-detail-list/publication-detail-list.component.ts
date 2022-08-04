import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  CabinetManagerService,
  Category,
  Publication,
  PublicationForGUI,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { Moment } from 'moment';
import { UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatDatepicker } from '@angular/material/datepicker';

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

@Component({
  selector: 'perun-web-apps-publication-detail-list',
  templateUrl: './publication-detail-list.component.html',
  styleUrls: ['./publication-detail-list.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS },
  ],
})
export class PublicationDetailListComponent implements OnInit {
  @Input() publication: PublicationForGUI;
  @Input() categories: Category[] = [];
  @Output() edited: EventEmitter<boolean> = new EventEmitter<boolean>();
  loading = false;
  dataSource: MatTableDataSource<{ key; value }> = null;
  displayedColumns = ['key', 'value'];
  isChanging = new SelectionModel<{ key: string; value: string }>(true, []);
  keys: string[];
  values: string[];
  map: { key: string; value: string }[] = [];
  yearControl: UntypedFormControl;
  categoryControl: UntypedFormControl;
  rankControl: UntypedFormControl;
  titleControl: UntypedFormControl;
  editing = false;
  maxYear: Moment;

  constructor(
    private cabinetService: CabinetManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.keys = [
      'Id / Origin',
      'Year',
      'Category',
      'Rank',
      'ISBN / ISSN',
      'DOI',
      'Full cite',
      'Created by',
      'Create date',
    ];
    this.values = [
      this.publication.id.toString(),
      this.publication.year.toString(),
      this.publication.categoryName,
      this.publication.rank.toString(),
      this.publication.isbn,
      this.publication.doi,
      this.publication.main,
      this.publication.createdBy,
      this.publication.createdDate,
    ];

    for (let i = 0; i < this.keys.length; ++i) {
      this.map.push({ key: this.keys[i], value: this.values[i] });
    }
    this.dataSource = new MatTableDataSource<{ key; value }>(this.map);

    this.titleControl = new UntypedFormControl(this.publication.title, Validators.required);
    this.yearControl = new UntypedFormControl(moment().year(this.publication.year));
    this.categoryControl = new UntypedFormControl(this.publication.categoryName);
    this.rankControl = new UntypedFormControl(this.publication.rank, [
      Validators.pattern(/^[0-9]+(\.[0-9])?$/),
      Validators.required,
    ]);

    this.maxYear = moment();

    this.loading = false;
  }

  edit(): void {
    this.editing = true;
  }

  save(): void {
    this.loading = true;
    this.editing = false;

    const categoryId = this.categories.find((cat) => cat.name === this.categoryControl.value).id;
    const year: number = (this.yearControl.value as Moment).year();

    const updatedPublication: Publication = {
      id: this.publication.id,
      beanName: this.publication.beanName,
      externalId: this.publication.externalId,
      publicationSystemId: this.publication.publicationSystemId,
      title: this.titleControl.value as string,
      year: year,
      main: this.publication.main,
      isbn: this.publication.isbn,
      doi: this.publication.doi,
      categoryId: categoryId,
      rank: this.rankControl.value as number,
      locked: this.publication.locked,
      createdBy: this.publication.createdBy,
      createdDate: this.publication.createdDate,
    };

    this.cabinetService.updatePublication({ publication: updatedPublication }).subscribe(
      () => {
        this.translate
          .get('PUBLICATION_DETAIL.CHANGE_PUBLICATION_SUCCESS')
          .subscribe((success: string) => {
            this.notificator.showSuccess(success);
            this.edited.emit(true);
            this.loading = false;
          });
      },
      () => (this.loading = false)
    );
  }

  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Date>): void {
    const ctrlValue = this.yearControl.value as Moment;
    ctrlValue.year(normalizedYear.year());
    this.yearControl.setValue(ctrlValue);
    datepicker.close();
  }
}
