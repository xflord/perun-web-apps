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
  user: User;
  vos: Vo[] = [];
  resources: RichResource[] = [];
  currentQuota: string;
  defaultQuota: string;
  quotasMarkup = '';
  filteredVos: Vo[] = [];
  loading: boolean;

  constructor(
    private store: StoreService,
    private usersManagerService: UsersManagerService,
    private membersService: MembersManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private attributesManagerService: AttributesManagerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.user = this.store.getPerunPrincipal().user;

    this.usersManagerService.getVosWhereUserIsMember(this.user.id).subscribe((vos) => {
      this.vos = vos;
      this.filteredVos = vos;
    });
  }

  getMembersResources(vo: Vo): void {
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

  getResAttributes(id: number): void {
    this.attributesManagerService.getResourceAttributes(id).subscribe((atts) => {
      let quotaAttribute = atts.find((att) => att.friendlyName === 'dataQuotas');
      if (quotaAttribute?.value) {
        const values = Object.entries(quotaAttribute.value as { [s: string]: string }).map(
          (entry) => String(entry[1])
        );
        this.currentQuota = values[0];
      } else {
        this.currentQuota = '';
      }
      quotaAttribute = atts.find((att) => att.friendlyName === 'defaultDataQuotas');
      if (quotaAttribute?.value) {
        const values = Object.entries(quotaAttribute.value as { [s: string]: string }).map(
          (entry) => String(entry[1])
        );
        this.defaultQuota = values[0];
      } else {
        this.defaultQuota = '';
      }
      if (!this.currentQuota) {
        this.currentQuota = this.defaultQuota;
      }
      this.parseMarkup();
    });
  }

  requestChangeQuota(vo: Vo, resource: RichResource): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = { vo: vo, resource: resource, user: this.user, currentQuota: this.quotasMarkup };

    this.dialog.open(RequestChangeDataQuotaDialogComponent, config);
  }

  applyFilter(filter: string): void {
    this.filteredVos = this.vos.filter((vo) =>
      vo.name.toLowerCase().includes(filter.toLowerCase())
    );
  }

  private parseMarkup(): void {
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
}
