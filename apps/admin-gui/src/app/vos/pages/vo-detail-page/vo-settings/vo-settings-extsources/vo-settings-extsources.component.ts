import { Component, OnInit } from '@angular/core';
import { ExtSource, ExtSourcesManagerService, Vo } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { AddExtSourceDialogComponent } from '../../../../../shared/components/dialogs/add-ext-source-dialog/add-ext-source-dialog.component';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { TABLE_VO_EXTSOURCES_SETTINGS } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemoveExtSourceDialogComponent } from '../../../../../shared/components/dialogs/remove-ext-source-dialog/remove-ext-source-dialog.component';

@Component({
  selector: 'app-vo-settings-extsources',
  templateUrl: './vo-settings-extsources.component.html',
  styleUrls: ['./vo-settings-extsources.component.scss'],
})
export class VoSettingsExtsourcesComponent implements OnInit {
  constructor(
    private extSourceService: ExtSourcesManagerService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {
    this.translate
      .get('VO_DETAIL.SETTINGS.EXT_SOURCES.SUCCESS_REMOVED')
      .subscribe((result) => (this.successMessage = result));
  }

  vo: Vo;
  extSources: ExtSource[] = [];
  selection = new SelectionModel<ExtSource>(true, []);
  loading: boolean;
  filterValue = '';
  successMessage: string;
  tableId = TABLE_VO_EXTSOURCES_SETTINGS;
  displayedColumns = [];

  addAuth: boolean;
  removeAuth: boolean;

  ngOnInit() {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.refreshTable();
  }

  setAuthRights() {
    this.addAuth = this.authResolver.isAuthorized('addExtSource_Vo_ExtSource_policy', [this.vo]);
    this.removeAuth = this.authResolver.isAuthorized('removeExtSource_Vo_ExtSource_policy', [
      this.vo,
    ]);
    this.displayedColumns = this.removeAuth
      ? ['select', 'id', 'name', 'type']
      : ['id', 'name', 'type'];
  }

  refreshTable() {
    this.loading = true;
    this.extSourceService.getVoExtSources(this.vo.id).subscribe((sources) => {
      this.extSources = sources;
      this.selection.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onAdd() {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data = {
      voId: this.vo.id,
      extSources: this.extSources,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(AddExtSourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((added) => {
      if (added) {
        this.refreshTable();
      }
    });
  }

  onRemove() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      voId: this.vo.id,
      extSources: this.selection.selected,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(RemoveExtSourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((removed) => {
      if (removed) {
        this.refreshTable();
      }
    });
  }
}
