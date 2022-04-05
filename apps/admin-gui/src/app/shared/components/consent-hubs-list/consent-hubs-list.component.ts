import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ConsentHub, ConsentsManagerService } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService, TableCheckbox } from '@perun-web-apps/perun/services';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EditEnforceConsentsDialogComponent } from '../dialogs/edit-enforce-consents-dialog/edit-enforce-consents-dialog.component';

@Component({
  selector: 'app-perun-web-apps-consent-hubs-list',
  templateUrl: './consent-hubs-list.component.html',
  styleUrls: ['./consent-hubs-list.component.scss'],
})
export class ConsentHubsListComponent implements OnChanges {
  constructor(
    private tableCheckbox: TableCheckbox,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private consentsManager: ConsentsManagerService
  ) {}

  @Input() consentHubs: ConsentHub[];
  @Input() filterValue = '';
  @Input() displayedColumns: string[] = ['id', 'name', 'enforceConsents', 'facilities'];
  @Input() tableId: string;

  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  private sort: MatSort;

  dataSource: MatTableDataSource<ConsentHub>;
  exporting = false;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<ConsentHub>(this.consentHubs);
    this.setDataSource();
  }

  getDataForColumn(data: ConsentHub, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return data.name;
      case 'enforceConsents':
        return data.enforceConsents ? 'true' : 'false';
      case 'facilities': {
        let result = '';
        data.facilities.forEach((f) => (result += f.name + ' #' + f.id + ';'));
        return result.slice(0, -1);
      }
      default:
        return '';
    }
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        this.getDataForColumn,
        this
      ),
      format
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: ConsentHub, filter: string) =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          this.getDataForColumn,
          this
        );
      this.dataSource.sortData = (data: ConsentHub[], sort: MatSort) =>
        customDataSourceSort(data, sort, this.getDataForColumn, this);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  changeEnforceFlag(consentHub: ConsentHub, event: MatSlideToggleChange): void {
    // Prevent default slide toggle change
    event.source.checked = consentHub.enforceConsents;

    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      theme: 'admin-theme',
      enforceConsents: consentHub.enforceConsents,
      consentHubName: consentHub.name,
    };

    const dialogRef = this.dialog.open(EditEnforceConsentsDialogComponent, config);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        consentHub.enforceConsents = !consentHub.enforceConsents;
        this.consentsManager.updateConsentHub({ consentHub: consentHub }).subscribe(
          (ch) => {
            event.source.checked = ch.enforceConsents;
            consentHub.enforceConsents = ch.enforceConsents;
            this.translate
              .get('SHARED.COMPONENTS.CONSENT_HUBS_LIST.CHANGE_ENFORCE_CONSENTS_SUCCESS')
              .subscribe((success) => {
                this.notificator.showSuccess(success);
              });
          },
          () => (consentHub.enforceConsents = !consentHub.enforceConsents)
        );
      }
    });
  }
}
