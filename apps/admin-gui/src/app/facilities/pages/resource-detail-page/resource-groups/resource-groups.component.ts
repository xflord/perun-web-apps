import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Resource,
  ResourcesManagerService
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { RemoveGroupFromResourceDialogComponent } from '../../../../shared/components/dialogs/remove-group-from-resource-dialog/remove-group-from-resource-dialog.component';
import { AssignGroupToResourceDialogComponent } from '../../../../shared/components/dialogs/assign-group-to-resource-dialog/assign-group-to-resource-dialog.component';
import {
  TABLE_RESOURCE_ALLOWED_GROUPS,
} from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { GroupWithStatus } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-perun-web-apps-resource-groups',
  templateUrl: './resource-groups.component.html',
  styleUrls: ['./resource-groups.component.scss']
})
export class ResourceGroupsComponent implements OnInit {

  resourceId: number;
  assignedGroups: GroupWithStatus[] = [];
  selected = new SelectionModel<GroupWithStatus>(true, []);
  loading: boolean;
  filteredValue = '';
  groupsToDisable: Set<number>;

  tableId = TABLE_RESOURCE_ALLOWED_GROUPS;
  resource: Resource;
  loadingResource: boolean;

  constructor(private route: ActivatedRoute,
              private resourcesManager: ResourcesManagerService,
              private dialog: MatDialog,
              public guiAuthResolver: GuiAuthResolver) {
  }

  ngOnInit() {
    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      this.resourceId = parentParams['resourceId'];
      this.getDataForAuthorization();
      this.loadAllGroups();
    });
  }

  loadAllGroups() {
    this.loading = true;
    this.resourcesManager.getGroupAssignments(this.resourceId, [Urns.GROUP_SYNC_ENABLED]).subscribe(assignedGroups => {
      this.assignedGroups = <GroupWithStatus[]>assignedGroups.map(g => {
        const gws: GroupWithStatus = g.enrichedGroup.group;
        gws.status = g.status;
        gws.failureCause = g.failureCause;
        gws.sourceGroupId = g.sourceGroupId;
        return gws;
      });
      this.groupsToDisable = new Set(this.assignedGroups.filter(group => !!group.sourceGroupId).map(group => group.id));
      this.selected.clear();
      this.loading = false;
    });
  }

  addGroup() {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data = { theme: 'resource-theme', resource: this.resource };

    const dialogRef = this.dialog.open(AssignGroupToResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllGroups();
      }
    });
  }

  removeGroups() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {resourceId: this.resourceId, groups: this.selected.selected, theme: 'resource-theme'};

    const dialogRef = this.dialog.open(RemoveGroupFromResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllGroups();
      }
    });
  }

  canRemoveGroups() {
    let canRemove = true;
    this.selected.selected.forEach(group => {
      if(!this.guiAuthResolver.isAuthorized('removeGroupsFromResource_List<Group>_Resource_policy',[this.resource, group])){
        canRemove = false;
      }
    });
    return canRemove;
  }

  applyFilter(filterValue: string) {
    this.filteredValue = filterValue;
  }

  private getDataForAuthorization() {
    this.loadingResource = true;
    this.resourcesManager.getResourceById(this.resourceId).subscribe(resource => {
      this.resource = resource;
      this.loadingResource = false;
    });
  }
}
