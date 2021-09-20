import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { RichUser } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import {
  downloadData, getDataForExport,
   parseFullName, parseLogins,  parseUserEmail, parseVo,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import {
  DynamicDataSource,
  DynamicPaginatingService,
  GuiAuthResolver,
  TableCheckbox
} from '@perun-web-apps/perun/services';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-users-dynamic-list',
  templateUrl: './users-dynamic-list.component.html',
  styleUrls: ['./users-dynamic-list.component.css']
})
export class UsersDynamicListComponent implements OnInit, OnChanges, AfterViewInit {

  constructor(private authResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox,
              private dynamicPaginatingService: DynamicPaginatingService) { }

  @ViewChild(TableWrapperComponent, {static: true}) child: TableWrapperComponent;

  @ViewChild(MatSort) sort: MatSort;

  @Input()
  selection = new SelectionModel<RichUser>(true, []);

  @Input()
  displayedColumns: string[] = ['select', 'user', 'id', 'name', 'email', 'logins', 'organization'];

  @Input()
  pageSize = 10;

  @Input()
  disableRouting = false;

  @Input()
  searchString = '';

  @Input()
  attrNames: string[] = [];

  @Input()
  withoutVo: boolean;

  @Output()
  page = new EventEmitter<PageEvent>();

  dataSource: DynamicDataSource<RichUser>;

  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.child.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.child.paginator.page)
      .pipe(
        tap(() => this.loadUsersPage())
      )
      .subscribe();
  }

  ngOnInit() {
    if (!this.authResolver.isPerunAdminOrObserver()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }

    this.dataSource = new DynamicDataSource<RichUser>(this.dynamicPaginatingService, this.authResolver);
    this.dataSource.loadUsers(this.attrNames, this.pageSize, 0, 'ASCENDING',
      'NAME', this.searchString, this.withoutVo);
  }

  ngOnChanges() {
    if (this.dataSource) {
      this.child.paginator.pageIndex = 0;
      this.loadUsersPage();
    }
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.getData().forEach(row => this.selection.select(row));
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pageSize;
    return numSelected === numRows;
  }

  checkboxLabel(row?: RichUser): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  loadUsersPage() {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'name' ? 'NAME' : 'ID';
    this.dataSource.loadUsers(this.attrNames, this.pageSize, this.child.paginator.pageIndex, sortDirection,
      sortColumn, this.searchString, this.withoutVo);
  }

  exportData(format: string) {
    downloadData(getDataForExport(this.dataSource.getData(), this.displayedColumns, this.getExportDataForColumn, this), format);
  }

  getExportDataForColumn(data: RichUser, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'user':
        return data.serviceUser ? 'service-user' : 'user';
      case 'name':
        if(data){
          return parseFullName(data)
        }
        return ''
      case 'organization':
        return parseVo(data);
      case 'email':
        return parseUserEmail(data);
      case 'logins':
        return parseLogins(data);
      default:
        return '';
    }
  }

}
