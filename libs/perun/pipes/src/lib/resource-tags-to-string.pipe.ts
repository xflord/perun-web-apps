import { Pipe, PipeTransform } from '@angular/core';
import { ResourceTag } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'resourceTagsToString',
})
export class ResourceTagsToStringPipe implements PipeTransform {
  transform(value: ResourceTag[]): string {
    if (value == null) {
      return null;
    }
    const tags = value;

    let result = '';

    tags.forEach(function (tag) {
      result = result.concat(tag.tagName);
    });

    return result;
  }
}
