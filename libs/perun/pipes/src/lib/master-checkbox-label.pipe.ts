import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'masterCheckboxLabel',
})
export class MasterCheckboxLabelPipe implements PipeTransform {
  transform(isAllSelected: boolean): string {
    const base = 'SHARED_LIB.PERUN.CHECKBOX_LABEL.';
    return isAllSelected ? base + 'DESELECT_ALL' : base + 'SELECT_ALL';
  }
}
