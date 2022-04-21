import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { downloadData, getDataForExport, TableWrapperComponent } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-string-list',
  templateUrl: './string-list.component.html',
  styleUrls: ['./string-list.component.scss'],
})
export class StringListComponent implements OnChanges, AfterViewInit {
  @Input() values: string[] = [];
  @Input() selection = new SelectionModel<string>(false, []);
  @Input() alertText = '';
  @Input() headerColumnText = '';
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;
  displayedColumns: string[] = ['select', 'value'];
  dataSource: MatTableDataSource<string>;
  private sort: MatSort;

  static getExportDataForColumn(data: string): string {
    return data;
  }

  ngOnChanges(): void {
    this.values = this.values ? this.values : [];
    this.dataSource = new MatTableDataSource<string>(this.values);
    this.setDataSource();
  }

  exportData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.filteredData,
        this.displayedColumns,
        StringListComponent.getExportDataForColumn
      ),
      format
    );
  }

  setDataSource(): void {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }

  checkboxLabel(row?: string): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  ngAfterViewInit(): void {
    this.setDataSource();
  }
}
