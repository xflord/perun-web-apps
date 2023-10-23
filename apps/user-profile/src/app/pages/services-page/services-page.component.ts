import { Component, OnInit } from '@angular/core';
import {
  MembersManagerService,
  ResourcesManagerService,
  RichResource,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-services-page',
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss'],
})
export class ServicesPageComponent implements OnInit {
  vos: Vo[];
  userId: number;
  resources: RichResource[] = [];
  filteredVos: Vo[] = [];
  loading: boolean;

  constructor(
    private usersManagerService: UsersManagerService,
    private membersManagerService: MembersManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private storage: StoreService,
  ) {}

  ngOnInit(): void {
    this.userId = this.storage.getPerunPrincipal().userId;
    this.usersManagerService.getVosWhereUserIsMember(this.userId).subscribe((vos) => {
      this.vos = vos;
      this.filteredVos = vos;
    });
  }

  getMemberData(vo: Vo): void {
    if (this.resources.length && this.resources[0].voId === vo.id) {
      return;
    }
    this.loading = true;
    this.resources = [];
    this.membersManagerService.getMemberByUser(vo.id, this.userId).subscribe((member) => {
      this.resourcesManagerService
        .getAssignedRichResourcesWithMember(member.id)
        .subscribe((resources) => {
          this.resources = resources;
          this.loading = false;
        });
    });
  }

  applyFilter(filter: string): void {
    this.filteredVos = this.vos.filter((res) =>
      res.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }
}
