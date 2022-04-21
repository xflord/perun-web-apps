import { Component, OnInit } from '@angular/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemovePublicationDialogComponent } from '../../dialogs/remove-publication-dialog/remove-publication-dialog.component';
import { FilterPublication } from '../../components/publication-filter/publication-filter.component';
import { CabinetManagerService, PublicationForGUI } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Filter } from '../Filter';

@Component({
  selector: 'perun-web-apps-all-publications-page',
  templateUrl: './all-publications-page.component.html',
  styleUrls: ['./all-publications-page.component.scss'],
})
export class AllPublicationsPageComponent implements OnInit {
  loading: boolean;
  publications: PublicationForGUI[];
  selected = new SelectionModel<PublicationForGUI>(true, []);
  tableId = TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS;
  filter: Filter = {
    title: null,
    isbnissn: null,
    doi: null,
    category: null,
    startYear: null,
    endYear: null,
  };

  constructor(
    private route: ActivatedRoute,
    private cabinetService: CabinetManagerService,
    private dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'publications',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/publications-dark.svg')
    );
  }

  ngOnInit(): void {
    this.refreshTable();
  }

  removePublication(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = this.selected.selected;

    const dialogRef = this.dialog.open(RemovePublicationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.selected.clear();
    this.cabinetService
      .findPublicationsByGUIFilter(
        this.filter.title,
        null,
        null,
        null,
        null,
        this.filter.category,
        +this.filter.startYear,
        +this.filter.endYear,
        null
      )
      .subscribe((publications) => {
        this.publications = publications;
        this.loading = false;
      });
  }

  filterPublication(event: FilterPublication): void {
    this.filter = event;
    this.refreshTable();
  }
}
