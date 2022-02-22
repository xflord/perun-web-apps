import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[perunWebAppsMiddleClickRouterLink]',
})
export class MiddleClickRouterLinkDirective {
  @Input() perunWebAppsMiddleClickRouterLink: string[];

  @HostListener('mouseup', ['$event']) onClick(event: MouseEvent): void {
    if (
      event.button === 1 &&
      this.perunWebAppsMiddleClickRouterLink !== null &&
      this.perunWebAppsMiddleClickRouterLink !== undefined
    ) {
      const fullUrl = this.perunWebAppsMiddleClickRouterLink.join('/');
      const queryParams = location.search;
      window.open(fullUrl + queryParams);
    }
  }
}
