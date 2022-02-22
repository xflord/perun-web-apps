import { Pipe, PipeTransform } from '@angular/core';

export interface TranslatedElem {
  label_en: string;
  label_cs: string;
  title_en: string;
  title_cs: string;
}

@Pipe({
  name: 'localisedText',
})
export class LocalisedTextPipe implements PipeTransform {
  transform(element: TranslatedElem, lang: string, type: string): string {
    return element[`${type}_${lang}`] as string;
  }
}
