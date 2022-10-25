import { Pipe, PipeTransform } from '@angular/core';
import { Author } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'authorsSeparatedByComma',
})
export class AuthorsSeparatedByCommaPipe implements PipeTransform {
  transform(value: Author[]): string {
    const authors: string[] = [];
    value.forEach((author) => authors.push(author.firstName + ' ' + author.lastName));
    return authors.join(', ');
  }
}
