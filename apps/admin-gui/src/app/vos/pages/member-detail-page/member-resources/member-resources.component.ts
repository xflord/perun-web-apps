import { Component, OnInit } from '@angular/core';
import {
  Member,
  MembersManagerService,
  PerunBean,
  ResourcesManagerService,
  RichResource,
} from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { TABLE_MEMBER_RESOURCE_LIST } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddMemberToResourceDialogComponent } from '../../../../shared/components/dialogs/add-member-to-resource-dialog/add-member-to-resource-dialog.component';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-member-resources',
  templateUrl: './member-resources.component.html',
  styleUrls: ['./member-resources.component.scss'],
})
export class MemberResourcesComponent implements OnInit {
  member: Member;
  resources: RichResource[] = [];
  filterValue = '';
  loading = false;
  displayedColumns: string[] = ['id', 'name', 'vo', 'facility', 'tags', 'description'];
  tableId = TABLE_MEMBER_RESOURCE_LIST;
  routeAuth: boolean;
  addAuth: boolean;
  voBean: PerunBean;

  constructor(
    private dialog: MatDialog,
    private memberManager: MembersManagerService,
    private resourceManager: ResourcesManagerService,
    private route: ActivatedRoute,
    private authResolver: GuiAuthResolver,
    private entityService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.member = this.entityService.getEntity();
    this.voBean = { id: this.member.voId, beanName: 'Vo' };
    this.addAuth =
      this.authResolver.isAuthorized('getRichResources_Vo_policy', [this.voBean]) &&
      this.authResolver.isAuthorized('addMembers_Group_List<Member>_policy', [this.voBean]);
    this.refreshTable();
  }

  addResource(): void {
    const config = getDefaultDialogConfig();
    config.width = '1200px';
    config.data = {
      memberId: this.member.id,
      voId: this.member.voId,
      theme: 'member-theme',
    };

    const dialogRef = this.dialog.open(AddMemberToResourceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.resourceManager
      .getAssignedRichResourcesWithMember(this.member.id)
      .subscribe((resources) => {
        this.resources = resources;
        if (this.resources.length !== 0) {
          this.routeAuth = this.authResolver.isAuthorized('getResourceById_int_policy', [
            this.voBean,
            this.resources[0],
          ]);
        }
        this.loading = false;
      });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
