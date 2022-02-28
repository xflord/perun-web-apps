import { Component, OnInit } from '@angular/core';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
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
  private loadSuccess: string;

  constructor(
    private extSourceService: ExtSourcesManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    public authResolver: GuiAuthResolver
  ) {
    this.translate
      .get('ADMIN.EXT_SOURCES.LOAD_SUCCESS')
      .subscribe((result: string) => (this.loadSuccess = result));
  }

  ngOnInit(): void {
    this.refreshTable();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  onLoad(): void {
    this.extSourceService.loadExtSourcesDefinitions().subscribe(() => {
      this.notificator.showSuccess(this.loadSuccess);
      this.refreshTable();
    });
  }

  private refreshTable(): void {
    this.loading = true;
    this.extSourceService.getExtSources().subscribe((result) => {
      this.extSources = result;
      this.loading = false;
    });
  }
}
