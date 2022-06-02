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
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

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

  constructor(
    private dialog: MatDialog,
    private memberManager: MembersManagerService,
    private resourceManager: ResourcesManagerService,
    private route: ActivatedRoute,
    private authResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.route.parent.params.subscribe((parentParams) => {
      const memberId = Number(parentParams['memberId']);

      this.memberManager.getMemberById(memberId).subscribe((member) => {
        this.member = member;
        this.refreshTable();
      });
    });
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
        this.setAuthRights();
        this.loading = false;
      });
  }

  setAuthRights(): void {
    const vo: PerunBean = {
      id: this.member.voId,
      beanName: 'Vo',
    };

    this.addAuth =
      this.authResolver.isAuthorized('getRichResources_Vo_policy', [vo]) &&
      this.authResolver.isAuthorized('addMembers_Group_List<Member>_policy', [vo]);

    if (this.resources.length !== 0) {
      this.routeAuth = this.authResolver.isAuthorized('getResourceById_int_policy', [
        vo,
        this.resources[0],
      ]);
    }
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
