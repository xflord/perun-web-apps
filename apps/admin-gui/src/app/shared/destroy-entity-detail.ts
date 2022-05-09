import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

// eslint-disable-next-line
export type Constructor<T = {}> = new (...args: any[]) => T;
// eslint-disable-next-line
export const destroyDetailMixin = <T extends Constructor>(base: T = class {} as T) =>
  class extends base implements OnDestroy {
    destroyed$ = new Subject<void>();
    ngOnDestroy(): void {
      this.destroyed$.next();
    }
  };
