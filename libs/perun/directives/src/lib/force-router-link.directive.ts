import { Directive, HostListener, Inject, Input } from '@angular/core';
import { ForceRouterService } from '@perun-web-apps/perun/services';

@Directive({
  selector: '[perunWebAppsForceRouterLink]',
})
export class ForceRouterLinkDirective {
  @Input() perunWebAppsForceRouterLink: string[];

  constructor(@Inject(ForceRouterService) private router: ForceRouterService) {}

  @HostListener('click') onClick(): void {
    this.router.forceNavigate(this.perunWebAppsForceRouterLink);
  }
}
