import { Pipe, PipeTransform } from '@angular/core';

interface FooterElem {
  link_en: string;
  label_en: string;
  label_cs: string | null;
}

@Pipe({
  name: 'localisedLink',
})
export class LocalisedLinkPipe implements PipeTransform {
  transform(element: FooterElem, lang: string): string {
    const temp: string = element['link_' + lang] as string;
    if (temp) {
      return temp;
    }
    return element['link_en'];
  }
}
