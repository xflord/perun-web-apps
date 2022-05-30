import { Pipe, PipeTransform } from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'validateExpiration',
  pure: true,
})
export class ValidateExpirationPipe implements PipeTransform {
  transform(expirationAttribute: Attribute): string {
    return (expirationAttribute?.value as string) ?? 'never';
  }
}
