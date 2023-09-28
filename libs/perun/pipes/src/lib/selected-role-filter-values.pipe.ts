import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'selectedRoleFilterValues' })
export class SelectedRoleFilterValuesPipe implements PipeTransform {
  transform(selectedValues: string[], totalCount: number): string {
    switch (selectedValues.length) {
      case totalCount:
        return 'ALL';
      case 0:
        return '';
      default:
        return `${selectedValues[0]}  ${
          selectedValues.length > 1
            ? '(+' +
              (selectedValues.length - 1).toString() +
              ' ' +
              (selectedValues.length === 2 ? 'other)' : 'others)')
            : ''
        }`;
    }
  }
}
