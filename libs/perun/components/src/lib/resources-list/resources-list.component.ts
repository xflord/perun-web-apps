import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Group, ResourceTag, RichResource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS,
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import { TableWrapperComponent } from '@perun-web-apps/perun/utils';
import { ResourceWithStatus } from '@perun-web-apps/perun/models';

@Component({
  selector: 'perun-web-apps-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss'],
})
export class ResourcesListComponent implements OnInit, OnChanges {
  constructor(private guiAuthResolver: GuiAuthResolver, private tableCheckbox: TableCheckbox) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  @Input()
  resources: ResourceWithStatus[] = [];
  @Input()
  selection = new SelectionModel<ResourceWithStatus>(true, []);
  @Input()
  filterValue: string;
  @Input()
  disableRouting = false;
  @Input()
  routingVo = false;
  @Input()
  displayedColumns: string[] = [
    'select',
    'id',
    'recent',
    'indirectResourceAssigment',
    'name',
    'vo',
    'voId',
    'status',
    'facility',
    'facilityId',
    'tags',
    'description',
  ];
  @Input()
  groupToResource: Group;
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input()
  recentIds: number[];
  @Input()
  groupId: number = null;
  @Input()
  resourcesToDisableCheckbox: Set<number> = new Set<number>();
  @Input()
  tableId: string;

  @Output()
  refreshTable: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  allSelected = new EventEmitter();

  private sort: MatSort;

  dataSource: MatTableDataSource<RichResource>;

  removeAuth = false;

  addAuth = false;
  disabledRouting: boolean;

  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  ngOnInit() {
    this.disabledRouting = this.disableRouting;
  }

  ngOnChanges() {
    if (!this.guiAuthResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    this.setDataSource();
    this.setAuth();
  }

  getDataForColumn(
    data: ResourceWithStatus,
    column: string,
    otherThis: ResourcesListComponent
  ): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return data.vo.name;
      case 'name':
        return data.name;
      case 'facility':
        return data.facility.name;
      case 'description':
        return data.description;
      case 'recent':
        if (otherThis.recentIds) {
          if (otherThis.recentIds.indexOf(data.id) > -1) {
            return '#'.repeat(otherThis.recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      case 'tags': {
        if (!data.resourceTags) {
          return data[column];
        }
        const tags = <[ResourceTag]>data.resourceTags;
        let result = '';
        tags.forEach(function (tag) {
          result = result.concat(tag.tagName);
        });
        return result;
      }
      case 'status':
        return data.status;
      case 'uuid':
        return data.uuid;
      default:
        return data[column];
    }
  }

  exportData(format: string) {
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

  setDataSource() {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<RichResource>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filterPredicate = (data: RichResource, filter: string) =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns,
          this.getDataForColumn,
          this,
          true
        );
      this.dataSource.sortData = (data: RichResource[], sort: MatSort) =>
        customDataSourceSort(data, sort, this.getDataForColumn, this);
    }
    this.dataSource.filter = this.filterValue;
    this.dataSource.data = this.resources;
  }

  canBeSelected = (group: ResourceWithStatus): boolean => !this.disableSelect(group);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const isAllSelected = this.tableCheckbox.isAllSelectedWithDisabledCheckbox(
      this.selection.selected.length,
      this.filterValue,
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.child.paginator.pageIndex,
      this.dataSource,
      this.sort,
      this.canBeSelected
    );
    this.allSelected.emit(isAllSelected);
    return isAllSelected;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.tableCheckbox.masterToggle(
      this.isAllSelected(),
      this.selection,
      this.filterValue,
      this.dataSource,
      this.sort,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      true,
      this.canBeSelected
    );
    this.setAuth();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ResourceWithStatus): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  setAuth() {
    const objects = this.groupToResource ? [this.groupToResource] : [];
    this.removeAuth = this.selection.selected.reduce(
      (acc, res) =>
        acc &&
        this.guiAuthResolver.isAuthorized(
          'removeGroupFromResources_Group_List<Resource>_policy',
          objects.concat([res])
        ),
      true
    );
    this.addAuth = this.selection.selected.reduce(
      (acc, res) =>
        acc &&
        this.guiAuthResolver.isAuthorized(
          'assignGroupToResources_Group_List<Resource>_policy',
          objects.concat([res])
        ),
      true
    );
  }

  itemSelectionToggle(item: ResourceWithStatus) {
    this.selection.toggle(item);
    this.setAuth();
  }

  disableSelect(resource: ResourceWithStatus) {
    return this.resourcesToDisableCheckbox.has(resource.id);
  }
}
