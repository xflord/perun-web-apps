import { Pipe, PipeTransform } from '@angular/core';
import { FooterColumn, FooterElement } from '@perun-web-apps/perun/models';

@Pipe({
  name: 'localisedText',
})
export class LocalisedTextPipe implements PipeTransform {
  transform(element: FooterColumn | FooterElement, lang: string, type: string): string {
    return element[`${type}_${lang}`] as string;
  }
}
