import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  Application,
  ApplicationsOrderColumn,
  AppState,
  AuditMessage,
  MemberGroupStatus,
  MembersOrderColumn,
  PaginatedApplications,
  PaginatedAuditMessages,
  PaginatedRichMembers,
  PaginatedRichUsers,
  RichMember,
  RichUser,
  SortingOrder,
  UsersOrderColumn,
  VoMemberStatuses,
} from '@perun-web-apps/perun/openapi';
import { DynamicPaginatingService } from './dynamic-paginating.service';
import { GuiAuthResolver } from './gui-auth-resolver.service';

export class DynamicDataSource<T> implements DataSource<T> {
  private dataSubject = new BehaviorSubject<T[]>([]);

  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  public allObjectCount = 0;

  public routeAuth = true;

  private latestQueryTime: number;

  constructor(
    private dynamicPaginatingService: DynamicPaginatingService,
    private authzService: GuiAuthResolver
  ) {}

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
  ) {
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
          const data: RichMember[] = (<PaginatedRichMembers>paginatedRichMembers).data;
          if (data !== null && data.length !== 0) {
            this.routeAuth = this.authzService.isAuthorized('getMemberById_int_policy', [
              { beanName: 'Vo', id: voId },
              data[0],
            ]);
          }
          this.allObjectCount = (<PaginatedRichMembers>paginatedRichMembers).totalCount;
          // @ts-ignore
          this.dataSubject.next(data);
        }
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
  ) {
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
          const data: RichUser[] = (<PaginatedRichUsers>paginatedRichUsers).data;
          this.allObjectCount = (<PaginatedRichUsers>paginatedRichUsers).totalCount;
          // @ts-ignore
          this.dataSubject.next(data);
        }
      });
  }

  loadAuditMessages(pageSize: number, pageIndex: number, sortOrder: SortingOrder) {
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
          const data: AuditMessage[] = (<PaginatedAuditMessages>paginatedAuditMessages).data;
          this.allObjectCount = (<PaginatedAuditMessages>paginatedAuditMessages).totalCount;
          // @ts-ignore
          this.dataSubject.next(data);
        }
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
    voId: number
  ) {
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
        groupId
      )
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((paginatedApplications) => {
        if (this.latestQueryTime <= thisQueryTime) {
          const data: Application[] = (<PaginatedApplications>paginatedApplications).data;
          if (data !== null && data.length !== 0) {
            if (data[0].group) {
              this.routeAuth = this.authzService.isAuthorized(
                'getApplicationsForGroup_Group_List<String>_policy',
                [data[0].group]
              );
            } else {
              this.routeAuth = this.authzService.isAuthorized(
                'getApplicationsForVo_Vo_List<String>_Boolean_policy',
                [data[0].vo]
              );
            }
          }
          this.allObjectCount = (<PaginatedApplications>paginatedApplications).totalCount;
          // @ts-ignore
          this.dataSubject.next(data);
        }
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
