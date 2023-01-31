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
  styleUrls: ['./table-wrapper.component.css'],
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
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  pageChangedBottom(event: PageEvent): void {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.page.emit(event);
    this.pageSize = event.pageSize;
    if (this.tableId) {
      this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
    }
    this.topNav.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    }); // scroll to top of table on page changes
  }
}
