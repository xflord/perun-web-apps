import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  MAT_PAGINATOR_DEFAULT_OPTIONS,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { TABLE_ITEMS_COUNT_OPTIONS } from '../perun-utils';
import { TableConfigService } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'perun-web-apps-table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrls: ['./table-wrapper.component.scss'],
  providers: [
    { provide: MAT_PAGINATOR_DEFAULT_OPTIONS, useValue: { formFieldAppearance: 'fill' } },
  ],
})
export class TableWrapperComponent implements OnInit {
  @Input() hideExport = false;
  @Input() pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input() dataLength = 0;
  @Input() tableId: string;
  @Input() allowExportAll = true;
  @Output() exportDisplayedData = new EventEmitter<string>();
  @Output() exportAllData = new EventEmitter<string>();
  @ViewChild('topNav') topNav: ElementRef<HTMLDivElement>;
  @ViewChild('table') table: ElementRef<HTMLDivElement>;

  pageSize = 5;
  paginator: MatPaginator;

  constructor(private tableConfigService: TableConfigService) {}

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  }

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    if (this.pageSizeOptions === null) {
      this.pageSize = 5;
    }

    this.paginator._changePageSize(this.pageSize); // Ensures that any subscriber to MatPaginator page event will get correct initial page size
  }

  pageChangedTop(event: PageEvent): void {
    if (this.table) {
      this.pageSize = event.pageSize;
      this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
      this.table.nativeElement.scroll({
        top: 0,
        behavior: 'smooth',
      }); // scroll to top of table on page changes
    }
  }

  changePage(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    let selectedPage = parseInt(input.value);

    if (!selectedPage || selectedPage < 1) {
      selectedPage = this.paginator.pageIndex + 1; // stay at current page
    }
    if (selectedPage > this.paginator.getNumberOfPages()) {
      selectedPage = this.paginator.getNumberOfPages();
    }

    this.paginator.pageIndex = selectedPage - 1;
    const changePageEvent: PageEvent = {
      length: this.paginator.length,
      pageSize: this.paginator.pageSize,
      pageIndex: this.paginator.pageIndex,
    };
    this.paginator.page.next(changePageEvent);

    input.value = selectedPage.toString();
  }

  onlyValidKeys(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    return (
      charCode === 65 || charCode === 66 || charCode === 68 || (charCode >= 48 && charCode <= 57)
    ); // Accept only digits 0-9, arrows, backspace or delete
  }
}
