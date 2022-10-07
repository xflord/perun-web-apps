import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkboxLabel',
})
export class CheckboxLabelPipe implements PipeTransform {
  transform(isSelected: boolean): string {
    const base = 'SHARED_LIB.PERUN.CHECKBOX_LABEL.';
    // this localization has a parameter for item name, don't forget to include in translate pipe
    return isSelected ? base + 'DESELECT_ROW' : base + 'SELECT_ROW';
  }
}
