import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  Attribute,
  AttributesManagerService,
  InputSetMemberResourceAttribute,
  MembersManagerService,
  ResourcesManagerService,
  RichResource,
  User,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { StoreService, NotificatorService } from '@perun-web-apps/perun/services';
import { compareFnName } from '@perun-web-apps/perun/utils';
import { TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'perun-web-apps-mailing-lists',
  templateUrl: './mailing-lists.component.html',
  styleUrls: ['./mailing-lists.component.scss'],
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
})
export class MailingListsComponent implements OnInit, OnDestroy {
  @Input() user: User;
  @Input() isService: boolean;
  vos: Vo[] = [];
  resources: RichResource[] = [];
  optOuts: InputSetMemberResourceAttribute[] = [];
  optOutAttribute: Attribute;
  index: number;
  filteredVos: Vo[] = [];
  loading = true;
  selectedVo: string = null;
  selectedResource: string = null;
  changeOptOut: string;
  routingSubscription: Subscription;

  constructor(
    private store: StoreService,
    private usersManagerService: UsersManagerService,
    private membersService: MembersManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private attributesManagerService: AttributesManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private location: Location,
  ) {}

  ngOnDestroy(): void {
    this.routingSubscription.unsubscribe();
    // clear the query params in the new component
    void this.router.navigate([location.pathname], {
      replaceUrl: true,
      queryParams: { vo: null, resource: null },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe((params) => {
        this.selectedVo = String(params['vo']);
        this.selectedResource = String(params['resource']);
        this.changeOptOut = String(params['action']);

        this.usersManagerService.getVosWhereUserIsMember(this.user.id).subscribe((vos) => {
          this.vos = vos.sort(compareFnName);
          this.filteredVos = vos;
          if (this.selectedResource !== undefined) {
            const vo = this.vos.find((obj) => obj.shortName === this.selectedVo);
            if (vo) {
              this.getMailingLists(vo);
            }
          } else if (this.selectedVo !== undefined) {
            const vo = this.vos.find((obj) => obj.shortName === this.selectedVo);
            if (vo) {
              this.getMailingLists(vo);
              this.changeSelectedVo(vo);
            }
          }
        });
      })
      .unsubscribe();
    this.routingSubscription = this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event) => {
        if (!event.url.startsWith(location.pathname)) {
          // clear the query params when navigating away
          this.location.replaceState(
            location.pathname,
            this.clearParamsFromCurrUrl(['vo', 'resource']),
          );
        }
      });
  }

  changeSelectedResource(resource: RichResource): void {
    if (this.selectedResource !== resource.name) {
      this.getOptOutAttribute(resource);
    }
    if (!this.isService) {
      if (this.changeOptOut) {
        if (this.changeOptOut === 'subscribe') {
          this.subscribe();
        } else if (this.changeOptOut === 'unsubscribe') {
          this.unsubscribe();
        }
        this.changeOptOut = null;
      }
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: { vo: this.selectedVo, resource: this.selectedResource, action: null },
        queryParamsHandling: 'merge',
      });
    }
  }

  changeSelectedVo(vo: Vo): void {
    if (this.selectedVo !== vo.shortName) {
      this.getMailingLists(vo);
      this.selectedResource = null;
    }
    if (!this.isService) {
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: { vo: this.selectedVo, resource: this.selectedResource },
        queryParamsHandling: 'merge',
      });
    }
  }

  getMailingLists(vo: Vo): void {
    this.selectedVo = vo.shortName;
    this.loading = true;
    this.resources = [];
    this.membersService.getMemberByUser(vo.id, this.user.id).subscribe((member) => {
      this.resourcesManagerService
        .getMailingServiceRichResourcesWithMember(member.id)
        .subscribe((resources) => {
          let count = resources.length;
          if (!count) {
            this.loading = false;
          }
          resources.forEach((resource) => {
            this.attributesManagerService
              .getRequiredAttributesMemberResource(member.id, resource.id)
              .subscribe((resAtts) => {
                this.attributesManagerService
                  .getResourceAttributeByName(
                    resource.id,
                    'urn:perun:resource:attribute-def:def:disableMailingListOptOut',
                  )
                  .subscribe((disableOptOut) => {
                    count--;
                    const attribute = resAtts.find(
                      (att) => att.friendlyName === 'optOutMailingList',
                    );
                    if (attribute && !((disableOptOut?.value as string) === 'true')) {
                      this.optOuts.push({
                        resource: resource.id,
                        member: member.id,
                        attribute: attribute,
                      });
                      this.resources.push(resource);
                      if (this.selectedResource === resource.name) {
                        this.getOptOutAttribute(resource);
                        this.changeSelectedResource(resource);
                      }
                    }
                    this.loading = count !== 0;
                  });
              });
          });
        });
      this.resources.sort(compareFnName);
    });
  }

  getOptOutAttribute(resource: RichResource): void {
    this.selectedResource = resource.name;
    this.index = this.resources.indexOf(resource);
    this.optOutAttribute = this.optOuts[this.index].attribute;
  }

  unsubscribe(): void {
    const originalState = String(this.optOuts[this.index].attribute.value);
    this.optOuts[this.index].attribute.value = 'true';
    this.attributesManagerService.setMemberResourceAttribute(this.optOuts[this.index]).subscribe(
      () => {
        this.notificator.showSuccess(
          (this.translate.instant(
            'SHARED_LIB.PERUN.COMPONENTS.OPT_OUT_MAILING_LISTS.UNSUBSCRIBED',
          ) as string) +
            this.selectedResource +
            '.',
        );
      },
      () => {
        this.optOuts[this.index].attribute.value = originalState;
      },
    );
  }
  subscribe(): void {
    const originalState = String(this.optOuts[this.index].attribute.value);
    this.optOuts[this.index].attribute.value = null;
    this.attributesManagerService.setMemberResourceAttribute(this.optOuts[this.index]).subscribe(
      () => {
        this.notificator.showSuccess(
          (this.translate.instant(
            'SHARED_LIB.PERUN.COMPONENTS.OPT_OUT_MAILING_LISTS.SUBSCRIBED',
          ) as string) +
            this.selectedResource +
            '.',
        );
      },
      () => {
        this.optOuts[this.index].attribute.value = originalState;
      },
    );
  }

  setOptOut(): void {
    if (this.optOutAttribute.value) {
      this.subscribe();
    } else {
      this.unsubscribe();
    }
  }

  applyFilter(mailingListsFilter: string): void {
    this.filteredVos = this.vos.filter((vo) =>
      vo.name.toLowerCase().includes(mailingListsFilter.toLowerCase()),
    );
  }

  deselectVo(): void {
    this.loading = true;
    this.selectedVo = null;
    this.selectedResource = null;
    if (!this.isService) {
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: { vo: this.selectedVo, resource: this.selectedResource },
        queryParamsHandling: 'merge',
      });
    }
  }

  deselectResource(): void {
    this.selectedResource = null;
    if (!this.isService) {
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: { vo: this.selectedVo, resource: this.selectedResource },
        queryParamsHandling: 'merge',
      });
    }
  }

  clearParamsFromCurrUrl(paramsToClear: string[]): string {
    const searchParams = new URLSearchParams(location.search);
    paramsToClear.forEach((param) => searchParams.delete(param));
    return searchParams.toString();
  }
}
