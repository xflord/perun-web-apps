import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'perun-web-apps-settings-mailing-lists',
  templateUrl: './settings-mailing-lists.component.html',
  styleUrls: ['./settings-mailing-lists.component.scss'],
})
export class SettingsMailingListsComponent implements OnInit, OnDestroy {
  user: User;
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

  constructor(
    private store: StoreService,
    private usersManagerService: UsersManagerService,
    private membersService: MembersManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private attributesManagerService: AttributesManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnDestroy(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vo: null, resource: null },
      replaceUrl: true,
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe((params) => {
        this.selectedVo = String(params['vo']);
        this.selectedResource = String(params['resource']);
        this.changeOptOut = String(params['action']);

        this.user = this.store.getPerunPrincipal().user;

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
  }

  changeSelectedResource(resource: RichResource): void {
    if (this.selectedResource !== resource.name) {
      this.getOptOutAttribute(resource);
    }
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
      queryParams: { vo: this.selectedVo, resource: this.selectedResource, action: null },
      queryParamsHandling: 'merge',
    });
  }

  changeSelectedVo(vo: Vo): void {
    if (this.selectedVo !== vo.shortName) {
      this.getMailingLists(vo);
      this.selectedResource = null;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vo: this.selectedVo, resource: this.selectedResource },
      queryParamsHandling: 'merge',
    });
  }

  getMailingLists(vo: Vo): void {
    this.selectedVo = vo.shortName;
    this.loading = true;
    this.resources = [];
    this.membersService.getMemberByUser(vo.id, this.user.id).subscribe((member) => {
      this.resourcesManagerService
        .getAssignedRichResourcesWithMember(member.id)
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
                    'urn:perun:resource:attribute-def:def:disableMailingListOptOut'
                  )
                  .subscribe((disableOptOut) => {
                    count--;
                    const attribute = resAtts.find(
                      (att) => att.friendlyName === 'optOutMailingList'
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
          (this.translate.instant('OPT_OUT_MAILING_LISTS.UNSUBSCRIBED') as string) +
            this.selectedResource +
            '.'
        );
      },
      () => {
        this.optOuts[this.index].attribute.value = originalState;
      }
    );
  }
  subscribe(): void {
    const originalState = String(this.optOuts[this.index].attribute.value);
    this.optOuts[this.index].attribute.value = null;
    this.attributesManagerService.setMemberResourceAttribute(this.optOuts[this.index]).subscribe(
      () => {
        this.notificator.showSuccess(
          (this.translate.instant('OPT_OUT_MAILING_LISTS.SUBSCRIBED') as string) +
            this.selectedResource +
            '.'
        );
      },
      () => {
        this.optOuts[this.index].attribute.value = originalState;
      }
    );
  }

  setOptOut(): void {
    if (this.optOutAttribute.value) {
      this.subscribe();
    } else {
      this.unsubscribe();
    }
  }

  applyFilter(filter: string): void {
    this.filteredVos = this.vos.filter((vo) =>
      vo.name.toLowerCase().includes(filter.toLowerCase())
    );
  }

  deselectVo(): void {
    this.loading = true;
    this.selectedVo = null;
    this.selectedResource = null;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vo: this.selectedVo, resource: this.selectedResource },
      queryParamsHandling: 'merge',
    });
  }

  deselectResource(): void {
    this.selectedResource = null;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vo: this.selectedVo, resource: this.selectedResource },
      queryParamsHandling: 'merge',
    });
  }
}
