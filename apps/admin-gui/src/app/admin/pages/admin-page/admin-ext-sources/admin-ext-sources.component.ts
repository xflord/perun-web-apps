import { Component, OnInit } from '@angular/core';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ExtSource, ExtSourcesManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_ADMIN_EXTSOURCES } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-admin-ext-sources',
  templateUrl: './admin-ext-sources.component.html',
  styleUrls: ['./admin-ext-sources.component.scss']
})
export class AdminExtSourcesComponent implements OnInit {

  constructor(private extSourceService: ExtSourcesManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              public authResolver: GuiAuthResolver
  ) {
    this.translate.get('ADMIN.EXT_SOURCES.LOAD_SUCCESS').subscribe(result => this.loadSuccess = result);
  }

  extSources: ExtSource[] = [];

  filterValue = '';

  loading = false;

  loadSuccess: string;
  tableId = TABLE_ADMIN_EXTSOURCES;

  ngOnInit() {
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
}
