import {DataSource} from "@angular/cdk/collections";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize} from "rxjs/operators";
import {
  AuditMessage,
  MemberGroupStatus,
  MembersOrderColumn, PaginatedAuditMessages,
  PaginatedRichMembers, PaginatedRichUsers,
  RichMember, RichUser,
  SortingOrder, UsersOrderColumn,
  VoMemberStatuses
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

  constructor(private dynamicPaginatingService: DynamicPaginatingService,
              private authzService: GuiAuthResolver) {}

  loadMembers(voId: number,
              attrNames: string[],
              sortOrder: SortingOrder,
              pageIndex: number,
              pageSize: number,
              sortColumn: MembersOrderColumn,
              statuses: VoMemberStatuses[],
              searchString?: string,
              groupId?: number,
              groupStatuses?: MemberGroupStatus[]) {

    this.loadingSubject.next(true);
    this.latestQueryTime = Date.now();
    const thisQueryTime = this.latestQueryTime;

    this.dynamicPaginatingService.getMembers(voId, attrNames, sortOrder, pageIndex, pageSize, sortColumn, statuses, searchString, groupId, groupStatuses).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(paginatedRichMembers => {
      if (this.latestQueryTime <= thisQueryTime) {
        const data: RichMember[] = (<PaginatedRichMembers>paginatedRichMembers).data;
        if(data !== null && data.length !== 0){
          this.routeAuth = this.authzService.isAuthorized('getMemberById_int_policy', [{beanName: 'Vo', id: voId}, data[0]]);
        }
        this.allObjectCount = (<PaginatedRichMembers>paginatedRichMembers).totalCount;
        // @ts-ignore
        this.dataSubject.next(data);
      }
    });
  }

  loadUsers(attrNames: string[],
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
            onlyAllowed: boolean) {
    this.loadingSubject.next(true);
    this.latestQueryTime = Date.now();
    const thisQueryTime = this.latestQueryTime;

    this.dynamicPaginatingService.getUsers(attrNames, sortOrder, pageIndex, pageSize, sortColumn, searchString,
      withoutVo, facilityId, voId, resourceId, serviceId, onlyAllowed).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(paginatedRichUsers => {
      if (this.latestQueryTime <= thisQueryTime) {
        const data: RichUser[] = (<PaginatedRichUsers>paginatedRichUsers).data;
        this.allObjectCount = (<PaginatedRichUsers>paginatedRichUsers).totalCount;
        // @ts-ignore
        this.dataSubject.next(data);
      }
    });
  }

  loadAuditMessages(pageSize: number,
            pageIndex: number,
            sortOrder: SortingOrder) {
    this.loadingSubject.next(true);
    this.latestQueryTime = Date.now();
    const thisQueryTime = this.latestQueryTime;

    this.dynamicPaginatingService.getAuditMessages(sortOrder, pageIndex, pageSize).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(paginatedAuditMessages => {
      if (this.latestQueryTime <= thisQueryTime) {
        const data: AuditMessage[] = (<PaginatedAuditMessages>paginatedAuditMessages).data;
        this.allObjectCount = (<PaginatedAuditMessages>paginatedAuditMessages).totalCount;
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
