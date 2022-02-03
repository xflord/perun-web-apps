import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localisedLink',
})
export class LocalisedLinkPipe implements PipeTransform {
  transform(element: any, lang: string): string {
    const temp = element['link_' + lang];
    if (temp) {
      return temp;
    }
    return element['link_en'];
  }
}
