import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import {
  AttributesManagerService,
  MembersManagerService,
  ResourcesManagerService,
  RichResource,
  User,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { RequestChangeDataQuotaDialogComponent } from '../../../components/dialogs/request-change-data-quota-dialog/request-change-data-quota-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-settings-data-quotas',
  templateUrl: './settings-data-quotas.component.html',
  styleUrls: ['./settings-data-quotas.component.scss'],
})
export class SettingsDataQuotasComponent implements OnInit {
  constructor(
    private store: StoreService,
    private usersManagerService: UsersManagerService,
    private membersService: MembersManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private attributesManagerService: AttributesManagerService,
    private dialog: MatDialog
  ) {}

  user: User;
  vos: Vo[] = [];
  resources: RichResource[] = [];
  currentQuota: string;
  defaultQuota: string;
  quotasMarkup = '';
  filteredVos: Vo[] = [];
  loading: boolean;

  ngOnInit() {
    this.user = this.store.getPerunPrincipal().user;

    this.usersManagerService.getVosWhereUserIsMember(this.user.id).subscribe((vos) => {
      this.vos = vos;
      this.filteredVos = vos;
    });
  }

  getMembersResources(vo: Vo) {
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
              .getResourceAttributes(resource.id)
              .subscribe((resAtts) => {
                count--;
                if (resAtts.find((att) => att.friendlyName === 'defaultDataQuotas')) {
                  this.resources.push(resource);
                }
                this.loading = count !== 0;
              });
          });
        });
    });
  }

  getResAttributes(id: number) {
    this.attributesManagerService.getResourceAttributes(id).subscribe((atts) => {
      let quotaAttribute = atts.find((att) => att.friendlyName === 'dataQuotas');
      if (quotaAttribute && quotaAttribute.value) {
        const keys = Object.keys(quotaAttribute.value);
        this.currentQuota = quotaAttribute.value[keys[0]];
      } else {
        this.currentQuota = '';
      }
      quotaAttribute = atts.find((att) => att.friendlyName === 'defaultDataQuotas');
      if (quotaAttribute) {
        const keys = Object.keys(quotaAttribute.value);
        this.defaultQuota = quotaAttribute.value[keys[0]];
      } else {
        this.defaultQuota = '';
      }
      if (!this.currentQuota) {
        this.currentQuota = this.defaultQuota;
      }
      this.parseMarkup();
    });
  }

  private parseMarkup() {
    let result = '';
    result += this.currentQuota;
    result += ` (default: ${this.defaultQuota})`;
    result = result
      .split(':')
      .join(' : ')
      .split('K')
      .join(' KiB')
      .split('M')
      .join(' MiB')
      .split('G')
      .join(' GiB')
      .split('T')
      .join(' TiB')
      .split('E')
      .join(' EiB');

    this.quotasMarkup = result;
  }

  requestChangeQuota(vo: Vo, resource: RichResource) {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = { vo: vo, resource: resource, user: this.user, currentQuota: this.quotasMarkup };

    this.dialog.open(RequestChangeDataQuotaDialogComponent, config);
  }

  applyFilter(filter: string) {
    this.filteredVos = this.vos.filter((vo) =>
      vo.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
}
