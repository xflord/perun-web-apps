import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[perunWebAppsMiddleClickRouterLink]',
})
export class MiddleClickRouterLinkDirective {
  @Input() perunWebAppsMiddleClickRouterLink: string[];

  constructor(
    private ref: ElementRef,
    private renderer: Renderer2,
  ) {
    const htmlElement: HTMLElement = this.ref.nativeElement as HTMLElement;
    this.renderer.listen(htmlElement, 'click', (event: MouseEvent) => {
      // ctrl (command) + left mouse click will stop routing and open router link in the new tab
      if (
        // ctrlKey = support for Windows/Linux keyboards
        // metaKey = support for Mac keyboards
        (event.ctrlKey || event.metaKey) &&
        event.button === 0 &&
        this.perunWebAppsMiddleClickRouterLink
      ) {
        if (htmlElement.tagName.toLowerCase() === 'tr') {
          // handle correct behavior for table 'tr' tag (with this directive)
          event.stopImmediatePropagation();
        } else {
          // handle correct behavior primarily for 'a' tag in our apps (with this directive)
          event.preventDefault();
        }
        window.open(this.getUrlWithParams());
      }
    });
  }

  @HostListener('mouseup', ['$event']) onClick(event: MouseEvent): void {
    if (event.button === 1 && this.perunWebAppsMiddleClickRouterLink) {
      window.open(this.getUrlWithParams());
    }
  }

  private getUrlWithParams(): string {
    const fullUrl = this.perunWebAppsMiddleClickRouterLink.join('/');
    const queryParams = location.search;
    return fullUrl + queryParams;
  }
}
