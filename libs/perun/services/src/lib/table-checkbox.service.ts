import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';

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
  isAllSelectedWithDisabledCheckbox<T>(
    rowsSelected: number,
    filter: string,
    pageSize: number,
    nextPage: boolean,
    pageIndex: number,
    dataSource: MatTableDataSource<T>,
    sort: MatSort,
    canBeSelected: (T) => boolean
  ): boolean {
    this.numSelected = rowsSelected;
    this.numCanBeSelected = 0;
    this.pageStart = pageIndex * pageSize;
    this.pageEnd = this.pageStart + pageSize;
    this.pageIterator = 0;
    this.dataLength = filter === '' ? dataSource.data.length : dataSource.filteredData.length;
    if (!nextPage) {
      this.modulo = this.dataLength % pageSize;
      this.pageEnd = this.modulo === 0 ? this.pageStart + pageSize : this.pageStart + this.modulo;
    }

    dataSource.sortData(dataSource.filteredData, sort).forEach((row: T) => {
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

  isAllSelected<T>(
    rowsSelected: number,
    filter: string,
    pageSize: number,
    nextPage: boolean,
    dataSource: MatTableDataSource<T>
  ): boolean {
    this.numSelected = rowsSelected;
    this.dataLength = filter === '' ? dataSource.data.length : dataSource.filteredData.length;
    if (nextPage) {
      this.numCanBeSelected = pageSize;
    } else {
      this.modulo = this.dataLength % pageSize;
      this.numCanBeSelected = this.modulo === 0 ? pageSize : this.modulo;
    }
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
}
