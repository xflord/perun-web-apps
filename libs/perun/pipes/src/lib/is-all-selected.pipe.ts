import { MatTableDataSource } from '@angular/material/table';
import {
  TableCheckbox,
  DynamicDataSource as PaginatedDataSource,
  isPaginatedDataSource,
} from '@perun-web-apps/perun/services';
import { Pipe, PipeTransform } from '@angular/core';
import { DynamicDataSource, isDynamicDataSource } from '@perun-web-apps/perun/models';

@Pipe({
  name: 'isAllSelected',
})
export class IsAllSelectedPipe implements PipeTransform {
  constructor(private tableCheckboxService: TableCheckbox) {}

  transform<T>(
    ds: MatTableDataSource<T> | DynamicDataSource<T> | PaginatedDataSource<T>,
    numberSelected: number,
    canBeSelected?: (item: T) => boolean,
  ): boolean {
    if (numberSelected === 0) return false;

    if (isPaginatedDataSource(ds)) {
      const numRows = ds.getData().length;
      return numberSelected === numRows;
    } else if (isDynamicDataSource(ds)) {
      return this.tableCheckboxService.isAllSelectedPaginated(ds, numberSelected, canBeSelected);
    }
    return this.tableCheckboxService.isAllSelected(numberSelected, ds, canBeSelected);
  }
}
