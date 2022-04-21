import { Component, OnInit } from '@angular/core';
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
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-settings-mailing-lists',
  templateUrl: './settings-mailing-lists.component.html',
  styleUrls: ['./settings-mailing-lists.component.scss'],
})
export class SettingsMailingListsComponent implements OnInit {
  user: User;
  vos: Vo[] = [];
  resources: RichResource[] = [];
  mailingLists: string[] = [];
  optOuts: InputSetMemberResourceAttribute[] = [];
  optOutAttribute: Attribute;
  index: number;
  filteredVos: Vo[] = [];
  loading: boolean;

  constructor(
    private store: StoreService,
    private usersManagerService: UsersManagerService,
    private membersService: MembersManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private attributesManagerService: AttributesManagerService
  ) {}

  ngOnInit(): void {
    this.user = this.store.getPerunPrincipal().user;

    this.usersManagerService.getVosWhereUserIsMember(this.user.id).subscribe((vos) => {
      this.vos = vos;
      this.filteredVos = vos;
    });
  }

  getMailingLists(vo: Vo): void {
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
                    if (
                      attribute &&
                      !(disableOptOut && (disableOptOut.value as unknown as string) === 'true')
                    ) {
                      this.optOuts.push({
                        resource: resource.id,
                        member: member.id,
                        attribute: attribute,
                      });
                      this.resources.push(resource);
                    }
                    this.loading = count !== 0;
                  });
              });
          });
        });
    });
  }

  getOptOutAttribute(resource: RichResource): void {
    this.index = this.resources.indexOf(resource);
    this.optOutAttribute = this.optOuts[this.index].attribute;
  }

  setOptOut(): void {
    this.optOuts[this.index].attribute.value = this.optOutAttribute.value
      ? null
      : ('true' as unknown as object);
    this.attributesManagerService
      .setMemberResourceAttribute(this.optOuts[this.index])
      .subscribe(() => {
        // console.log('done');
      });
  }

  applyFilter(filter: string): void {
    this.filteredVos = this.vos.filter((vo) =>
      vo.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
}
