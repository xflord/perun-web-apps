import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { DynamicDataSource } from '@perun-web-apps/perun/models';

@Injectable({
  providedIn: 'root',
})
export class TableCheckbox {
  private numSelected: number;
  private numCanBeSelected: number;
  private modulo: number;
  private pageStart: number;
  private pageEnd: number;
  private pageIterator: number;
  private dataLength: number;
  private itemsCheckedCounter: number;

  // checks if all rendered rows are selected (in this function also disabled checkboxes are allowed)
  isAllSelected<T>(
    rowsSelected: number,
    dataSource: MatTableDataSource<T>,
    canBeSelected: (item: T) => boolean = (): boolean => true
  ): boolean {
    const pageSize = dataSource.paginator.pageSize ?? 0;
    const pageIndex = dataSource.paginator.pageIndex ?? 0;
    const nextPage = dataSource.paginator.hasNextPage();
    const hasFilter = dataSource.data.length === dataSource.filteredData.length;

    this.numCanBeSelected = 0;
    this.pageStart = pageIndex * pageSize;
    this.pageEnd = this.pageStart + pageSize;
    this.numSelected = rowsSelected;
    this.dataLength = hasFilter ? dataSource.data.length : dataSource.filteredData.length;
    const sort = dataSource.sort;

    if (!nextPage) {
      this.modulo = this.dataLength % pageSize;
      this.pageEnd = this.modulo === 0 ? this.pageStart + pageSize : this.pageStart + this.modulo;
    }
    this.pageIterator = 0;

    const data = sort
      ? dataSource.sortData(dataSource.filteredData, sort)
      : dataSource.filteredData;
    data.forEach((row: T) => {
      if (
        this.pageStart <= this.pageIterator &&
        this.pageIterator < this.pageEnd &&
        canBeSelected(row)
      ) {
        this.numCanBeSelected++;
      }
      this.pageIterator++;
    });
    return this.numSelected === this.numCanBeSelected;
  }

  // checks all rendered checkboxes if they are able to check
  masterToggle<T>(
    isAllSelected: boolean,
    selection: SelectionModel<T>,
    filter: string,
    dataSource: MatTableDataSource<T>,
    sort: MatSort,
    pageSize: number,
    pageIndex: number,
    someCheckboxDisabled: boolean,
    canBeSelected?: (T) => boolean
  ): void {
    selection.clear();
    if (!isAllSelected) {
      this.itemsCheckedCounter = 0;
      this.pageStart = pageIndex * pageSize;
      this.pageEnd = this.pageStart + pageSize;
      this.pageIterator = 0;

      dataSource.sortData(dataSource.filteredData, sort).forEach((row) => {
        if (someCheckboxDisabled) {
          if (
            canBeSelected(row) &&
            this.pageStart <= this.pageIterator &&
            this.pageIterator < this.pageEnd
          ) {
            selection.select(row);
          }
        } else {
          if (this.pageStart <= this.pageIterator && this.pageIterator < this.pageEnd) {
            selection.select(row);
          }
        }

        this.pageIterator++;
      });
    }
  }

  /**
   * Determines if all rendered rows are selected.
   *
   * @param dataSource Dynamic data source
   * @param selectedCount number of selected rows
   * @param canBeSelected By default all rows can be selected
   */
  isAllSelectedPaginated<T>(
    dataSource: DynamicDataSource<T>,
    selectedCount: number,
    canBeSelected: (T) => boolean = (): boolean => true
  ): boolean {
    return (
      selectedCount ===
      dataSource.data.reduce((acc: number, val: T) => acc + Number(canBeSelected(val)), 0)
    );
  }

  /**
   * Handles the (de)select all actions
   *
   * @param dataSource Dynamic data source
   * @param selection Selection model
   * @param selectAll Flag, all rows to be selected
   * @param canBeSelected By default all rows can be selected
   */
  masterTogglePaginated<T>(
    dataSource: DynamicDataSource<T>,
    selection: SelectionModel<T>,
    selectAll: boolean,
    canBeSelected: (T) => boolean = (): boolean => true
  ): void {
    selection.clear();
    if (selectAll) {
      dataSource.data.forEach((row) => {
        if (canBeSelected(row)) {
          selection.select(row);
        }
      });
    }
  }
}
