import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Author,
  CabinetManagerService,
  Category,
  Publication,
  PublicationForGUI,
  ThanksForGUI,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-publication-detail',
  templateUrl: './publication-detail.component.html',
  styleUrls: ['./publication-detail.component.scss'],
})
export class PublicationDetailComponent implements OnInit {
  @Input() publicationId: number;
  loading = false;
  pubLoading = false;
  initLoading = false;
  publication: PublicationForGUI;
  categories: Category[];
  mode: string;
  mainAuthorId: number;
  mainAuthor: Author;
  disabledColumns: string[];
  selectionAuthors: SelectionModel<Author> = new SelectionModel<Author>(true, []);
  selectionThanks: SelectionModel<ThanksForGUI> = new SelectionModel<ThanksForGUI>(true, []);

  constructor(
    private route: ActivatedRoute,
    private cabinetService: CabinetManagerService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {
    this.matIconRegistry.addSvgIcon(
      'publications',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/publications-dark.svg')
    );
  }

  ngOnInit(): void {
    this.initLoading = true;
    if (this.publicationId) {
      this.setMode();
      this.loadAllData();
    } else {
      this.route.params.subscribe((params) => {
        this.publicationId = Number(params['publicationId']);
        this.mainAuthorId = Number(params['authorId']);
        this.setMode();
        this.loadAllData();
      });
    }
  }

  setMode(): void {
    const url = location.pathname;
    if (url.includes('my')) {
      this.mode = 'my';
    } else if (url.includes('all')) {
      this.mode = 'all';
    } else if (url.includes('import')) {
      this.mode = 'import';
    } else if (url.includes('create')) {
      this.mode = 'create';
    } else {
      this.mode = 'authors';
    }
  }

  loadAllData(): void {
    this.loading = true;
    this.cabinetService.findPublicationById(this.publicationId).subscribe((publication) => {
      this.publication = publication;

      this.cabinetService.getCategories().subscribe((categories) => {
        this.categories = categories;
        this.loading = false;
        this.initLoading = false;
      });
    });
  }

  refreshPublication(): void {
    this.pubLoading = true;
    this.cabinetService.findPublicationById(this.publicationId).subscribe((publication) => {
      this.publication = publication;
      this.pubLoading = false;
    });
  }

  changeLock(): void {
    this.pubLoading = true;
    const updatedPublication: Publication = {
      id: this.publication.id,
      beanName: 'Publication',
      externalId: this.publication.externalId,
      publicationSystemId: this.publication.publicationSystemId,
      title: this.publication.title,
      year: this.publication.year,
      main: this.publication.main,
      isbn: this.publication.isbn,
      doi: this.publication.doi,
      categoryId: this.publication.categoryId,
      rank: this.publication.rank,
      locked: this.publication.locked,
      createdBy: this.publication.createdBy,
      createdDate: this.publication.createdDate,
    };

    this.cabinetService
      .lockPublications({ publications: [updatedPublication], lock: !this.publication.locked })
      .subscribe(() => {
        this.translate
          .get('PUBLICATION_DETAIL.CHANGE_PUBLICATION_SUCCESS')
          .subscribe((success: string) => {
            this.notificator.showSuccess(success);
            this.refreshPublication();
          });
      });
  }
}
