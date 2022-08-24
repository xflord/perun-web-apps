import { MatTableDataSource } from '@angular/material/table';
import { TableCheckbox } from '@perun-web-apps/perun/services';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isAllSelected',
})
export class IsAllSelectedPipe implements PipeTransform {
  constructor(private tableCheckboxService: TableCheckbox) {}

  transform<T>(
    ds: MatTableDataSource<T>,
    numberSelected: number,
    canBeSelected?: (item: T) => boolean
  ): boolean {
    return this.tableCheckboxService.isAllSelected(numberSelected, ds, canBeSelected);
  }
}
