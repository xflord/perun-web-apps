import { Component, OnInit } from '@angular/core';
import { Author, CabinetManagerService } from '@perun-web-apps/perun/openapi';
import {
  TABLE_PUBLICATION_AUTHORS,
} from '@perun-web-apps/config/table-config';

@Component({
  selector: 'perun-web-apps-authors-page',
  templateUrl: './authors-page.component.html',
  styleUrls: ['./authors-page.component.scss']
})
export class AuthorsPageComponent implements OnInit {

  constructor(private cabinetService: CabinetManagerService) { }

  filterValue = '';
  loading: boolean;
  authors: Author[];
  tableId = TABLE_PUBLICATION_AUTHORS;

  ngOnInit(): void {
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.cabinetService.findAllAuthors().subscribe(authors => {
      this.authors = authors;
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
