import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'categoryLabel',
})
export class CategoryLabelPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}
  transform(categoryLabel: Record<string, string>): string {
    if (this.translate.currentLang in categoryLabel) {
      return categoryLabel[this.translate.currentLang];
    }
    if (this.translate.defaultLang in categoryLabel) {
      return categoryLabel[this.translate.defaultLang];
    }
    return categoryLabel[Object.keys(categoryLabel)[0]];
  }
}
