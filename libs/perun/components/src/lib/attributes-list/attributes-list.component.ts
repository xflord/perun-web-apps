import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { AttributeValueComponent } from './attribute-value/attribute-value.component';
import { Attribute } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  filterCoreAttributes,
  getDataForExport,
  isVirtualAttribute,
  TABLE_ITEMS_COUNT_OPTIONS,
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import { TableWrapperComponent } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-attributes-list',
  templateUrl: './attributes-list.component.html',
  styleUrls: ['./attributes-list.component.scss'],
})
export class AttributesListComponent implements OnChanges, AfterViewInit {
  @ViewChildren(AttributeValueComponent) items: QueryList<AttributeValueComponent>;
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  @Input() attributes: Attribute[] = [];
  @Input() selection = new SelectionModel<Attribute>(true, []);
  @Input() displayedColumns: string[] = ['select', 'id', 'displayName', 'value', 'description'];
  @Input() inDialog = false;
  @Input() filterValue = '';
  @Input() tableId: string;
  @Input() readonly = false;
  @Input() hiddenColumns: string[] = [];
  @Input() emptyListText = 'SHARED_LIB.PERUN.COMPONENTS.ATTRIBUTES_LIST.EMPTY_SETTINGS';
  dataSource: MatTableDataSource<Attribute>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  private sort: MatSort;

  constructor(private authResolver: GuiAuthResolver, private tableCheckbox: TableCheckbox) {}

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  static canBeSelected(attribute: Attribute): boolean {
    return !isVirtualAttribute(attribute) && attribute.writable;
  }

  static getDataForColumn(data: Attribute, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'displayName':
        return data.displayName;
      case 'description':
        return data.description;
      case 'value':
        return JSON.stringify(data.value);
      case 'urn':
        return data.namespace + ':' + data.baseFriendlyName;
      default:
        return '';
    }
  }

  ngOnChanges(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<Attribute>(filterCoreAttributes(this.attributes));
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
        AttributesListComponent.getDataForColumn
      ),
      format
    );
  }

  setDataSource(): void {
    this.displayedColumns = this.displayedColumns.filter((x) => !this.hiddenColumns.includes(x));
    if (this.dataSource) {
      this.dataSource.filterPredicate = (data: Attribute, filter: string): boolean =>
        customDataSourceFilterPredicate(
          data,
          filter,
          this.displayedColumns.concat('urn'),
          AttributesListComponent.getDataForColumn
        );
      this.dataSource.sortData = (data: Attribute[], sort: MatSort): Attribute[] =>
        customDataSourceSort(data, sort, AttributesListComponent.getDataForColumn);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  isAllSelected(): boolean {
    return this.tableCheckbox.isAllSelectedWithDisabledCheckbox(
      this.selection.selected.length,
      this.filterValue,
      this.child.paginator.pageSize,
      this.child.paginator.hasNextPage(),
      this.child.paginator.pageIndex,
      this.dataSource,
      this.sort,
      AttributesListComponent.canBeSelected
    );
  }

  masterToggle(): void {
    this.tableCheckbox.masterToggle(
      this.isAllSelected(),
      this.selection,
      this.filterValue,
      this.dataSource,
      this.sort,
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      true,
      AttributesListComponent.canBeSelected
    );
  }

  checkboxLabel(row?: Attribute): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  updateMapAttributes(): void {
    for (const item of this.items.toArray()) {
      if (item.attribute.type === 'java.util.LinkedHashMap') {
        item.updateMapAttribute();
      }
    }
  }

  onValueChange(attribute: Attribute): void {
    if (AttributesListComponent.canBeSelected(attribute)) {
      this.selection.select(attribute);
    }
  }

  getAttributeFullName(attribute: Attribute): string {
    return `${attribute.namespace}:${attribute.friendlyName}`;
  }
}
