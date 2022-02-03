import { Directive, ElementRef, HostListener, Inject, Input } from '@angular/core';
import { ForceRouterService } from '@perun-web-apps/perun/services';

@Directive({
  selector: '[perunWebAppsForceRouterLink]',
})
export class ForceRouterLinkDirective {
  constructor(
    private el: ElementRef,
    @Inject(ForceRouterService) private router: ForceRouterService
  ) {}

  @Input()
  perunWebAppsForceRouterLink: any[];

  @HostListener('click') onClick() {
    this.router.forceNavigate(this.perunWebAppsForceRouterLink);
  }
}
