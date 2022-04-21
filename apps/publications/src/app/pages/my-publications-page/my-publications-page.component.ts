import { Component, OnInit } from '@angular/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemovePublicationDialogComponent } from '../../dialogs/remove-publication-dialog/remove-publication-dialog.component';
import { FilterPublication } from '../../components/publication-filter/publication-filter.component';
import {
  AuthzResolverService,
  CabinetManagerService,
  PublicationForGUI,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Filter } from '../Filter';

@Component({
  selector: 'perun-web-apps-my-publications-page',
  templateUrl: './my-publications-page.component.html',
  styleUrls: ['./my-publications-page.component.scss'],
})
export class MyPublicationsPageComponent implements OnInit {
  loading: boolean;
  initLoading: boolean;
  publications: PublicationForGUI[];
  selected = new SelectionModel<PublicationForGUI>(true, []);
  tableId = TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS;
  authorId: number;
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
    private authResolver: AuthzResolverService
  ) {}

  ngOnInit(): void {
    this.initLoading = true;

    this.authResolver.getPerunPrincipal().subscribe((perunPrincipal) => {
      this.authorId = perunPrincipal.userId;
      this.initLoading = false;
      this.refreshTable();
    });
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
        this.authorId
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
