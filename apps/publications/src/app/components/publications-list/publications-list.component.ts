import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  CabinetManagerService,
  Publication,
  PublicationForGUI,
  RichResource,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import {
  customDataSourceSort,
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  parseFullName,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { NotificatorService, TableCheckbox } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ShowCiteDialogComponent } from '../../dialogs/show-cite-dialog/show-cite-dialog.component';

@Component({
  selector: 'perun-web-apps-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.scss'],
})
export class PublicationsListComponent implements OnChanges, AfterViewInit {
  @Input() publications: PublicationForGUI[];
  @Input() selection = new SelectionModel<PublicationForGUI>(true, []);
  @Input() displayedColumns: string[] = [
    'select',
    'id',
    'lock',
    'title',
    'reportedBy',
    'year',
    'category',
    'thankedTo',
    'cite',
  ];
  @Input() tableId: string;
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input() routerPath: string;
  @Input() disabledRouting = false;
  @Input() openInTab = false;
  @Input() allowAlert = true;
  @Output() publicationSelector: EventEmitter<PublicationForGUI> =
    new EventEmitter<PublicationForGUI>();
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  dataSource: MatTableDataSource<PublicationForGUI>;
  buttonPressed = false;
  changeLockMessage: string;
  locked: string;
  unlocked: string;

  private sort: MatSort;

  constructor(
    private tableCheckbox: TableCheckbox,
    private cabinetService: CabinetManagerService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {
    translate
      .get('PUBLICATIONS_LIST.CHANGE_LOCK_SUCCESS')
      .subscribe((value: string) => (this.changeLockMessage = value));
    translate.get('PUBLICATIONS_LIST.LOCKED').subscribe((value: string) => (this.locked = value));
    translate
      .get('PUBLICATIONS_LIST.UNLOCKED')
      .subscribe((value: string) => (this.unlocked = value));
  }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static getDataForColumn(data: PublicationForGUI, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'lock':
        return String(data.locked);
      case 'title':
        return data.title;
      case 'reportedBy': {
        let result = '';
        data.authors.forEach((a) => (result += parseFullName(a) + ';'));
        return result.slice(0, -1);
      }
      case 'year':
        return data.year.toString();
      case 'category':
        return data.categoryName;
      case 'thankedTo': {
        let res = '';
        data.thanks.forEach((t) => (res += t.ownerName + ';'));
        return res.slice(0, -1);
      }
      default:
        return data[column] as string;
    }
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<PublicationForGUI>(this.publications);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        PublicationsListComponent.getDataForColumn
      ),
      format
    );
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelected(
      this.selection.selected.length,
      '',
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
      '',
      this.dataSource,
      this.sort,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      false
    );
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: RichResource): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  itemSelectionToggle(item: RichResource): void {
    this.selection.toggle(item);
  }

  showCite(publication: PublicationForGUI): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = publication;

    this.dialog.open(ShowCiteDialogComponent, config);
  }

  lockOrUnlockPublication(publication: PublicationForGUI): void {
    this.cabinetService
      .lockPublications({
        publications: [this.createPublication(publication)],
        lock: !publication.locked,
      })
      .subscribe(() => {
        if (publication.locked) {
          this.notificator.showSuccess(this.changeLockMessage + this.unlocked);
        } else {
          this.notificator.showSuccess(this.changeLockMessage + this.locked);
        }
        publication.locked = !publication.locked;
      });
  }

  emitPublication(publication: PublicationForGUI): void {
    this.publicationSelector.emit(publication);
  }

  private setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.sortData = (data: PublicationForGUI[], sort: MatSort): PublicationForGUI[] =>
        customDataSourceSort(data, sort, PublicationsListComponent.getDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }

  private createPublication(publication: PublicationForGUI): Publication {
    return {
      id: publication.id,
      beanName: publication.beanName,
      externalId: publication.externalId,
      publicationSystemId: publication.publicationSystemId,
      categoryId: publication.categoryId,
      createdBy: publication.createdBy,
      createdDate: publication.createdDate,
      doi: publication.doi,
      isbn: publication.isbn,
      locked: publication.locked,
      main: publication.main,
      rank: publication.rank,
      title: publication.title,
      year: publication.year,
    };
  }
}
