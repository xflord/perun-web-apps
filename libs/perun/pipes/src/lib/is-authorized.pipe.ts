import { Pipe, PipeTransform } from '@angular/core';
import { PerunBean } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Pipe({
  name: 'isAuthorized',
})
export class IsAuthorizedPipe implements PipeTransform {
  constructor(private authResolver: GuiAuthResolver) {}

  transform(objs: PerunBean[], policy: string): boolean {
    return this.authResolver.isAuthorized(policy, objs);
  }
}
