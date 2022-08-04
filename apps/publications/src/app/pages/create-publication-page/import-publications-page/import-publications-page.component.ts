import { Component, OnInit } from '@angular/core';
import {
  CabinetManagerService,
  InputCreatePublication,
  Publication,
  PublicationForGUI,
  PublicationSystem,
} from '@perun-web-apps/perun/openapi';
import { UntypedFormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_IMPORT_PUBLICATIONS } from '@perun-web-apps/config/table-config';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { UniversalConfirmationDialogComponent } from '@perun-web-apps/perun/dialogs';
import { Moment } from 'moment';

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
  selector: 'perun-web-apps-import-publications-page',
  templateUrl: './import-publications-page.component.html',
  styleUrls: ['./import-publications-page.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS },
  ],
})
export class ImportPublicationsPageComponent implements OnInit {
  loading = false;
  publicationSystems: PublicationSystem[] = [];
  pubSystem = new UntypedFormControl();
  pubSystemNamespace: string;
  publications: PublicationForGUI[] = [];

  selected = new SelectionModel<PublicationForGUI>(true, []);
  tableId = TABLE_IMPORT_PUBLICATIONS;
  displayedColumns = ['select', 'id', 'lock', 'title', 'reportedBy', 'year', 'category'];
  firstSearchDone: boolean;

  startYear: UntypedFormControl;
  endYear: UntypedFormControl;

  userId: number;
  userAsAuthor = true;

  importedPublications: Publication[] = [];
  importDone = false;
  indexExpanded: number;
  completePublications: number[] = [];

  constructor(
    private cabinetService: CabinetManagerService,
    private storeService: StoreService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.firstSearchDone = false;
    this.userId = this.storeService.getPerunPrincipal().user.id;

    this.startYear = new UntypedFormControl(moment().subtract(1, 'year'));
    this.endYear = new UntypedFormControl(moment());

    this.cabinetService.getPublicationSystems().subscribe((publicationSystems) => {
      this.publicationSystems = publicationSystems.filter((ps) => ps.friendlyName !== 'INTERNAL');
      this.pubSystem.setValue(this.publicationSystems[0]);
      this.pubSystemNamespace = (this.pubSystem.value as PublicationSystem).loginNamespace;
      this.loading = false;
    });
  }

  selectPubSystem(): void {
    this.pubSystemNamespace = (this.pubSystem.value as PublicationSystem).loginNamespace;
  }

  searchPublications(): void {
    this.loading = true;
    this.firstSearchDone = true;

    this.cabinetService
      .findExternalPublications(
        this.storeService.getPerunPrincipal().user.id,
        (this.startYear.value as Moment).year(),
        (this.endYear.value as Moment).year(),
        this.pubSystemNamespace
      )
      .subscribe(
        (publications) => {
          this.publications = publications;
          this.loading = false;
        },
        () => (this.loading = false)
      );
  }

  importPublications(publications: PublicationForGUI[]): void {
    this.loading = true;
    if (publications.length === 0) {
      this.notificator.showSuccess(this.translate.instant('IMPORT_PUBLICATIONS.SUCCESS') as string);
      this.importDone = true;
      this.indexExpanded = 0;
      this.loading = false;
      return;
    }
    const publication = publications.shift();
    const publicationInput: InputCreatePublication = {
      publication: {
        id: 0,
        beanName: 'Publication',
        title: publication.title,
        categoryId: publication.categoryId,
        year: publication.year,
        isbn: publication.isbn,
        doi: publication.doi,
        main: publication.main,
      },
    };

    this.cabinetService.createPublication(publicationInput).subscribe(
      (pub) => {
        if (this.userAsAuthor) {
          this.cabinetService
            .createAutorship({
              authorship: {
                id: 0,
                beanName: 'Authorship',
                publicationId: pub.id,
                userId: this.userId,
              },
            })
            .subscribe(
              () => {
                this.importedPublications.push(pub);
                this.importPublications(publications);
              },
              () => (this.loading = false)
            );
        } else {
          this.importedPublications.push(pub);
          this.importPublications(publications);
        }
      },
      () => (this.loading = false)
    );
  }

  editPublication(index: number): void {
    this.indexExpanded = index === this.indexExpanded ? -1 : index;
  }

  completePublication(publicationId: number, indexExpanded: number): void {
    if (!this.completePublications.includes(publicationId)) {
      this.completePublications.push(publicationId);
    }
    if (indexExpanded !== this.importedPublications.length - 1) {
      this.indexExpanded = indexExpanded + 1;
    } else {
      this.indexExpanded = -1;
    }
  }

  incompletePublication(publicationId: number): void {
    if (this.completePublications.includes(publicationId)) {
      this.completePublications = this.completePublications.filter(
        (pubId) => pubId !== publicationId
      );
    }
    this.indexExpanded = -1;
  }

  completeAllPublications(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'user-theme',
      message: this.translate.instant('IMPORT_PUBLICATIONS.CHECK_ALL_MESSAGE') as string,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit();
      }
    });
  }

  onSubmit(): void {
    this.notificator.showSuccess(
      this.translate.instant('IMPORT_PUBLICATIONS.SHOW_FINISH') as string
    );
    void this.router.navigate(['/my-publications']);
  }
}
