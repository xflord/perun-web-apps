import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StoreService } from '@perun-web-apps/perun/services';

interface CustomLabel {
  label: string;
  en: string;
  cs: string;
}

@Pipe({
  name: 'customTranslate',
})
export class CustomTranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService, private storage: StoreService) {}

  transform(value: string, lang = 'en'): string {
    const customLabelElements: CustomLabel[] = this.storage.get('custom_labels') as CustomLabel[];
    if (customLabelElements) {
      for (const element of customLabelElements) {
        if (element.label === value) {
          return element[lang] as string;
        }
      }
    }
    return value;
  }
}
