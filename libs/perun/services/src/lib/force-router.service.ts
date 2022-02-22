import { Injectable } from '@angular/core';
import { NavigationExtras, NavigationStart, Router } from '@angular/router';

export type NavigateType = 'back' | 'forward';

/**
 * This class fixes one specific Angular routing bug. When user wants to redirect
 * from one entity to other entity with the same type, but with another id, then
 * the routing didn't use to work correctly.
 *
 * Example: Perun admin -> Users -> Select user -> Service Accounts -> Select service account
 */
@Injectable({
  providedIn: 'root',
})
export class ForceRouterService {
  private lastState: NavigateType = 'forward';
  private history: Set<number> = new Set<number>();

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          if (this.history.has(event.restoredState.navigationId)) {
            this.lastState = 'back';
            this.history.delete(event.restoredState.navigationId);
          } else {
            this.lastState = 'forward';
            this.history.add(event.id);
          }
        } else {
          this.history.add(event.id);
          this.lastState = 'forward';
        }
      }
    });
  }

  forceNavigate(commands: string[], extras?: NavigationExtras): void {
    if (commands === null) {
      return;
    }

    let fullUrl = '';
    commands.forEach((c) => (fullUrl += '/' + c));
    if (fullUrl.length > 0) {
      fullUrl = fullUrl.substring(1);
    }

    if (extras === undefined) {
      extras = {};
    }
    extras.queryParams = { redirectTo: fullUrl };

    void this.router.navigate(['redirect'], extras);
  }

  getLastState(): NavigateType {
    return this.lastState;
  }
}
