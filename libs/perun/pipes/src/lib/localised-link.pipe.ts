import { Pipe, PipeTransform } from '@angular/core';
import { FooterElement } from '@perun-web-apps/perun/models';

@Pipe({
  name: 'localisedLink',
})
export class LocalisedLinkPipe implements PipeTransform {
  transform(element: FooterElement, lang: string): string {
    const temp: string = element['link_' + lang] as string;
    if (temp) {
      return temp;
    }
    return element['link_en'];
  }
}
