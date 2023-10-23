import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { ActivatedRoute, QueryParamsHandling, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class QueryParamsRouterService {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  navigate(url: string[], relativeTo: ActivatedRoute = null): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      let paramsHandlingMethod: QueryParamsHandling = 'merge';
      const queryParams = Object.assign({}, params);

      if (location.pathname.endsWith('applicationForm/preview')) {
        paramsHandlingMethod = '';
        delete queryParams.applicationFormItems;
      }

      void this.router.navigate(url, {
        relativeTo: relativeTo,
        queryParams: queryParams,
        queryParamsHandling: paramsHandlingMethod,
      });
    });
  }
}
