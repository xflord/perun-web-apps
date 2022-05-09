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
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-perun-web-apps-consent-hubs-list',
  templateUrl: './consent-hubs-list.component.html',
  styleUrls: ['./consent-hubs-list.component.scss'],
})
export class ConsentHubsListComponent implements OnChanges {
  @Input() consentHubs: ConsentHub[];
  @Input() filterValue = '';
  @Input() displayedColumns: string[] = ['select', 'id', 'name', 'enforceConsents', 'facilities'];
  @Input() tableId: string;
  @Input() selection = new SelectionModel<ConsentHub>(true, []);
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  dataSource: MatTableDataSource<ConsentHub>;
  exporting = false;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  private sort: MatSort;

  constructor(
    private tableCheckbox: TableCheckbox,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private consentsManager: ConsentsManagerService
  ) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getDataForColumn(data: ConsentHub, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return data.name;
      case 'enforceConsents':
        return data.enforceConsents ? 'true' : 'false';
      case 'facilities': {
        let result = '';
        data.facilities.forEach((f) => (result += f.name + ' #' + String(f.id) + ';'));
        return result.slice(0, -1);
      }
      default:
        return '';
    }
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<ConsentHub>(this.consentHubs);
    this.setDataSource();
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        ConsentHubsListComponent.getDataForColumn
      ),
      format
    );
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelected(
      this.selection.selected.length,
      this.filterValue,
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.dataSource
    );
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.tableCheckbox.masterToggle(
      this.isAllSelected(),
      this.selection,
      this.filterValue,
      this.dataSource,
      this.sort,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      false
    );
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ConsentHub): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: ConsentHub, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          ConsentHubsListComponent.getDataForColumn
        );
      this.dataSource.sortData = (data: ConsentHub[], sort: MatSort): ConsentHub[] =>
        customDataSourceSort(data, sort, ConsentHubsListComponent.getDataForColumn);
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
              .subscribe((success: string) => {
                this.notificator.showSuccess(success);
              });
          },
          () => (consentHub.enforceConsents = !consentHub.enforceConsents)
        );
      }
    });
  }
}
