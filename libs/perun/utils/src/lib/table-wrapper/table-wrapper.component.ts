import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TABLE_ITEMS_COUNT_OPTIONS } from '../perun-utils';
import { TableConfigService } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'perun-web-apps-table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrls: ['./table-wrapper.component.css'],
})
export class TableWrapperComponent implements OnInit {
  public paginator: MatPaginator;
  @Input()
  hideExport = false;
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input()
  dataLength = 0;
  @Input()
  tableId: string;
  @Output()
  exportData = new EventEmitter<any>();

  pageSize = 5;

  constructor(private tableConfigService: TableConfigService) {}

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    if (this.pageSizeOptions === null) {
      this.pageSize = 5;
    }
  }

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  }

  pageChangedTop(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  pageChangedBottom(event: PageEvent) {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.page.emit(event);
    this.pageSize = event.pageSize;
    if (this.tableId) {
      this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
    }
  }
}
