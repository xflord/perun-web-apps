import { DataSource } from '@angular/cdk/collections';
import {
  Application,
  ApplicationsOrderColumn,
  AppState,
  AuditMessage,
  MemberGroupStatus,
  MembersOrderColumn,
  PaginatedAuditMessages,
  PaginatedRichApplications,
  PaginatedRichMembers,
  PaginatedRichUsers,
  RichApplication,
  RichMember,
  RichUser,
  SortingOrder,
  UsersOrderColumn,
  VoMemberStatuses,
} from '@perun-web-apps/perun/openapi';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DynamicPaginatingService } from './dynamic-paginating.service';
import { GuiAuthResolver } from './gui-auth-resolver.service';
import { MatTableDataSource } from '@angular/material/table';
import { DynamicDataSource as NewDynamicDataSource } from '@perun-web-apps/perun/models';

export function isPaginatedDataSource<T>(
  ds: MatTableDataSource<T> | DynamicDataSource<T> | NewDynamicDataSource<T>
): ds is DynamicDataSource<T> {
  return 'allObjectCount' in ds;
}

export class DynamicDataSource<T> implements DataSource<T> {
  loading$: Observable<boolean>;
  allObjectCount = 0;
  routeAuth = true;
  step = 10000;
  private latestQueryTime: number;
  private dataSubject = new BehaviorSubject<T[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private dynamicPaginatingService: DynamicPaginatingService,
    private authzService: GuiAuthResolver
  ) {
    this.loading$ = this.loadingSubject.asObservable();
  }

  loadMembers(
    voId: number,
    attrNames: string[],
    sortOrder: SortingOrder,
    pageIndex: number,
    pageSize: number,
    sortColumn: MembersOrderColumn,
    statuses: VoMemberStatuses[],
    searchString?: string,
    groupId?: number,
    groupStatuses?: MemberGroupStatus[]
  ): void {
    this.loadingSubject.next(true);
    this.latestQueryTime = Date.now();
    const thisQueryTime = this.latestQueryTime;

    this.dynamicPaginatingService
      .getMembers(
        voId,
        attrNames,
        sortOrder,
        pageIndex,
        pageSize,
        sortColumn,
        statuses,
        searchString,
        groupId,
        groupStatuses
      )
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((paginatedRichMembers) => {
        if (this.latestQueryTime <= thisQueryTime) {
          const data: RichMember[] = (paginatedRichMembers as PaginatedRichMembers).data;
          if (data !== null && data.length !== 0) {
            this.routeAuth = this.authzService.isAuthorized('getMemberById_int_policy', [
              { beanName: 'Vo', id: voId },
              data[0],
            ]);
          }
          this.allObjectCount = (paginatedRichMembers as PaginatedRichMembers).totalCount;
          this.dataSubject.next(data as unknown as T[]);
        }
      });
  }

  getAllMembers(
    voId: number,
    attrNames: string[],
    sortOrder: SortingOrder,
    totalCount: number,
    sortColumn: MembersOrderColumn,
    statuses: VoMemberStatuses[],
    searchString?: string,
    groupId?: number,
    groupStatuses?: MemberGroupStatus[]
  ): Observable<RichMember[]> {
    return new Observable((subscriber) => {
      const requests = [];
      for (let pageNumber = 0; pageNumber < Math.ceil(totalCount / this.step); pageNumber++) {
        requests.push(
          this.dynamicPaginatingService.getMembers(
            voId,
            attrNames,
            sortOrder,
            pageNumber,
            this.step,
            sortColumn,
            statuses,
            searchString,
            groupId,
            groupStatuses
          )
        );
      }
      forkJoin(requests).subscribe({
        next: (results) => {
          const mergedData = [].concat(
            ...results.map((result) => (result as PaginatedRichMembers).data)
          );
          subscriber.next(mergedData as RichMember[]);
          subscriber.complete();
        },
        error: (error) => subscriber.error(error),
      });
    });
  }

  loadUsers(
    attrNames: string[],
    pageSize: number,
    pageIndex: number,
    sortOrder: SortingOrder,
    sortColumn: UsersOrderColumn,
    searchString: string,
    withoutVo: boolean,
    facilityId: number,
    voId: number,
    resourceId: number,
    serviceId: number,
    onlyAllowed: boolean
  ): void {
    this.loadingSubject.next(true);
    this.latestQueryTime = Date.now();
    const thisQueryTime = this.latestQueryTime;

    this.dynamicPaginatingService
      .getUsers(
        attrNames,
        sortOrder,
        pageIndex,
        pageSize,
        sortColumn,
        searchString,
        withoutVo,
        facilityId,
        voId,
        resourceId,
        serviceId,
        onlyAllowed
      )
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((paginatedRichUsers) => {
        if (this.latestQueryTime <= thisQueryTime) {
          const data: RichUser[] = (paginatedRichUsers as PaginatedRichUsers).data;
          this.allObjectCount = (paginatedRichUsers as PaginatedRichUsers).totalCount;
          this.dataSubject.next(data as unknown as T[]);
        }
      });
  }

  getAllUsers(
    attrNames: string[],
    order: SortingOrder,
    totalCount: number,
    sortColumn: UsersOrderColumn,
    searchString: string,
    withoutVo: boolean,
    facilityId: number,
    voId: number,
    resourceId: number,
    serviceId: number,
    onlyAllowed: boolean
  ): Observable<RichUser[]> {
    return new Observable((subscriber) => {
      const requests = [];
      for (let pageNumber = 0; pageNumber < Math.ceil(totalCount / this.step); pageNumber++) {
        requests.push(
          this.dynamicPaginatingService.getUsers(
            attrNames,
            order,
            pageNumber,
            this.step,
            sortColumn,
            searchString,
            withoutVo,
            facilityId,
            voId,
            resourceId,
            serviceId,
            onlyAllowed
          )
        );
      }
      forkJoin(requests).subscribe({
        next: (results) => {
          const mergedData = [].concat(
            ...results.map((result) => (result as PaginatedRichUsers).data)
          );
          subscriber.next(mergedData as RichUser[]);
          subscriber.complete();
        },
        error: (error) => subscriber.error(error),
      });
    });
  }

  loadAuditMessages(pageSize: number, pageIndex: number, sortOrder: SortingOrder): void {
    this.loadingSubject.next(true);
    this.latestQueryTime = Date.now();
    const thisQueryTime = this.latestQueryTime;

    this.dynamicPaginatingService
      .getAuditMessages(sortOrder, pageIndex, pageSize)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((paginatedAuditMessages) => {
        if (this.latestQueryTime <= thisQueryTime) {
          const data: AuditMessage[] = (paginatedAuditMessages as PaginatedAuditMessages).data;
          this.allObjectCount = (paginatedAuditMessages as PaginatedAuditMessages).totalCount;
          this.dataSubject.next(data as unknown as T[]);
        }
      });
  }

  getAllAuditMessages(totalCount: number, sortOrder: SortingOrder): Observable<AuditMessage[]> {
    return new Observable((subscriber) => {
      const requests = [];
      for (let pageNumber = 0; pageNumber < Math.ceil(totalCount / this.step); pageNumber++) {
        requests.push(
          this.dynamicPaginatingService.getAuditMessages(sortOrder, pageNumber, this.step)
        );
      }
      forkJoin(requests).subscribe({
        next: (results) => {
          const mergedData = [].concat(
            ...results.map((result) => (result as PaginatedAuditMessages).data)
          );
          subscriber.next(mergedData as AuditMessage[]);
          subscriber.complete();
        },
        error: (error) => subscriber.error(error),
      });
    });
  }

  loadApplications(
    pageSize: number,
    pageIndex: number,
    sortOrder: SortingOrder,
    sortColumn: ApplicationsOrderColumn,
    searchString: string,
    includeGroupApps: boolean,
    states: AppState[],
    dateFrom: string,
    dateTo: string,
    userId: number,
    groupId: number,
    voId: number,
    details?: boolean
  ): void {
    this.loadingSubject.next(true);
    this.latestQueryTime = Date.now();
    const thisQueryTime = this.latestQueryTime;

    this.dynamicPaginatingService
      .getApplications(
        pageSize,
        pageIndex,
        sortOrder,
        sortColumn,
        includeGroupApps,
        searchString,
        states,
        dateFrom,
        dateTo,
        userId,
        voId,
        groupId,
        details ?? false
      )
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((paginatedApplications) => {
        if (this.latestQueryTime <= thisQueryTime) {
          const data: Application[] = (paginatedApplications as PaginatedRichApplications).data;
          if (data !== null && data.length !== 0) {
            const d = data;
            if (d[0].group) {
              this.routeAuth = this.authzService.isAuthorized(
                'getApplicationsForGroup_Group_List<String>_policy',
                [d[0].group]
              );
            } else {
              this.routeAuth = this.authzService.isAuthorized(
                'getApplicationsForVo_Vo_List<String>_Boolean_policy',
                [d[0].vo]
              );
            }
          }
          this.allObjectCount = (paginatedApplications as PaginatedRichApplications).totalCount;
          this.dataSubject.next(data as unknown as T[]);
        }
      });
  }

  getAllApplications(
    totalCount: number,
    sortOrder: SortingOrder,
    sortColumn: ApplicationsOrderColumn,
    searchString: string,
    includeGroupApps: boolean,
    states: AppState[],
    dateFrom: string,
    dateTo: string,
    userId: number,
    groupId: number,
    voId: number,
    details?: boolean
  ): Observable<RichApplication[]> {
    return new Observable((subscriber) => {
      const requests = [];
      for (let pageNumber = 0; pageNumber < Math.ceil(totalCount / this.step); pageNumber++) {
        requests.push(
          this.dynamicPaginatingService.getApplications(
            this.step,
            pageNumber,
            sortOrder,
            sortColumn,
            includeGroupApps,
            searchString,
            states,
            dateFrom,
            dateTo,
            userId,
            voId,
            groupId,
            details ?? false
          )
        );
      }
      forkJoin(requests).subscribe({
        next: (results) => {
          const mergedData = [].concat(
            ...results.map((result) => (result as PaginatedRichApplications).data)
          );
          subscriber.next(mergedData as RichApplication[]);
          subscriber.complete();
        },
        error: (error) => subscriber.error(error),
      });
    });
  }

  connect(): Observable<T[]> {
    return this.dataSubject.asObservable();
  }

  disconnect(): void {
    this.dataSubject.complete();
    this.loadingSubject.complete();
  }

  getData(): T[] {
    return this.dataSubject.value;
  }
}
