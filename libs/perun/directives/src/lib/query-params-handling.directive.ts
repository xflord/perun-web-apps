import { Directive, OnChanges } from '@angular/core';
import { QueryParamsHandling, RouterLink } from '@angular/router';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'tr[routerLink], a[routerLink]',
})
export class QueryParamsHandlingDirective extends RouterLink implements OnChanges {
  queryParamsHandling: QueryParamsHandling = 'merge';

  ngOnChanges(): void {
    // avoid to preserving application preview query params
    if (this.queryParams && 'applicationFormItems' in this.queryParams) {
      this.queryParamsHandling = '';
      const newParams = Object.assign({}, this.queryParams);
      delete newParams.applicationFormItems;
      this.queryParams = newParams;
    }
  }
}
