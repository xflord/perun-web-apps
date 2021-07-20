import { Component, OnInit } from '@angular/core';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ExtSource, ExtSourcesManagerService } from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_ADMIN_EXTSOURCES, TableConfigService } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-admin-ext-sources',
  templateUrl: './admin-ext-sources.component.html',
  styleUrls: ['./admin-ext-sources.component.scss']
})
export class AdminExtSourcesComponent implements OnInit {

  constructor(private extSourceService: ExtSourcesManagerService,
              private notificator: NotificatorService,
              private tableConfigService: TableConfigService,
              private translate: TranslateService,
              public authResolver: GuiAuthResolver
  ) {
    this.translate.get('ADMIN.EXT_SOURCES.LOAD_SUCCESS').subscribe(result => this.loadSuccess = result);
  }

  extSources: ExtSource[] = [];

  filterValue = '';

  loading = false;

  loadSuccess: string;
  pageSize: number;
  tableId = TABLE_ADMIN_EXTSOURCES;

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refreshTable();
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onLoad() {
    this.extSourceService.loadExtSourcesDefinitions().subscribe(() => {
      this.notificator.showSuccess(this.loadSuccess);
      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.extSourceService.getExtSources().subscribe(result => {
      this.extSources = result;
      this.loading = false;
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
