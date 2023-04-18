import { Component, OnInit } from '@angular/core';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { ExtSource, ExtSourcesManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_ADMIN_EXTSOURCES } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-admin-ext-sources',
  templateUrl: './admin-ext-sources.component.html',
  styleUrls: ['./admin-ext-sources.component.scss'],
})
export class AdminExtSourcesComponent implements OnInit {
  extSources: ExtSource[] = [];

  filterValue = '';

  loading = false;
  tableId = TABLE_ADMIN_EXTSOURCES;

  constructor(
    private extSourceService: ExtSourcesManagerService,
    public authResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.refreshTable();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  loadConfigExtSources(): void {
    this.loading = true;
    this.extSourceService.loadExtSourcesDefinitions().subscribe(() => {
      this.refreshTable();
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.extSourceService.getExtSources().subscribe((result) => {
      this.extSources = result;
      this.loading = false;
    });
  }
}
