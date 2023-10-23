import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { startWith, switchMap } from 'rxjs/operators';

export interface PageQuery {
  pageSize?: number;
  offset?: number;
  order?: 'ASCENDING' | 'DESCENDING';
  sortColumn?: string;
  searchString?: string;
}

export function isDynamicDataSource<T>(
  source: MatTableDataSource<T> | DynamicDataSource<T>,
): source is DynamicDataSource<T> {
  return `_count` in source;
}

/**
 * Data source that supports server-side filtering, sorting and pagination.
 * This data source does NOT implement these operations but emits filter, sort and page changes.
 *
 * Dependent on `@angular/material`
 */
export class DynamicDataSource<T> implements DataSource<T> {
  pageQuery$ = new BehaviorSubject<PageQuery>({});
  updateSubscription: Subscription | null = null;

  private data$ = new BehaviorSubject<T[]>([]);
  private _count: number;
  private _filter = new BehaviorSubject<string>('');
  private _sort: MatSort;
  private _paginator: MatPaginator;

  constructor(data: T[], count: number, ms: MatSort, mp: MatPaginator) {
    this.data$.next(data);
    this._count = count;
    this._sort = ms;
    this._paginator = mp;
    this.update();
  }

  /* eslint-disable @typescript-eslint/member-ordering */
  // Here ordering is disabled since it has unwanted interaction, setters and getters should be adjacent
  get data(): T[] {
    return this.data$.value;
  }
  set data(data: T[]) {
    this.data$.next(data);
  }

  get filteredData(): T[] {
    return this.data$.value;
  }

  get count(): number {
    return this._count;
  }
  set count(count: number) {
    this._count = count;
  }

  get sort(): MatSort {
    return this._sort;
  }
  set sort(ms: MatSort) {
    this._sort = ms;
    this.update();
  }

  get paginator(): MatPaginator {
    return this._paginator;
  }
  set paginator(mp: MatPaginator) {
    this._paginator = mp;
    this.update();
  }

  set filter(value: string) {
    this._filter.next(value);
  }
  /* eslint-enable @typescript-eslint/member-ordering */

  connect(): Observable<T[]> {
    return this.data$.asObservable();
  }

  disconnect(): void {
    this.data$.complete();
    this.updateSubscription?.unsubscribe();
  }

  // For compatibility with MatTableDataSource
  sortData(filteredData: T[], sort: MatSort): T[] {
    this.sort = sort;
    return filteredData;
  }

  /**
   * Updates all streams combined to get query page.
   * Triggers when sort or paginator is changed.
   */
  update(): void {
    // React to sort changes
    const sortChange: Observable<Sort> = this._sort.sortChange.pipe(
      startWith({ active: 'NAME', direction: this._sort.direction }),
    );

    // React to page changes
    const pageChange: Observable<PageEvent> = this._paginator.page.pipe(
      startWith({
        pageSize: 5,
        pageIndex: this._paginator.pageIndex,
        length: this._paginator.length,
      }),
    );

    // Combine sort, page and filter state
    // Each stream has to emit at least once for `combineLatest` to emit
    const query: Observable<PageQuery> = combineLatest([sortChange, pageChange, this._filter]).pipe(
      // Switch map ensures that with new changes, old request is canceled
      // Prevents older long request to override shorter new one
      switchMap(([sort, page, filter]) => {
        return of({
          order: sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING',
          sortColumn: sort.active.toUpperCase(),
          pageSize: page.pageSize,
          offset: page.pageIndex * page.pageSize,
          searchString: filter,
        } as PageQuery);
      }),
    );

    // Dispose of old subscription and set up new one
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = query.subscribe((searchQuery) => {
      this.pageQuery$.next(searchQuery);
    });
  }
}
