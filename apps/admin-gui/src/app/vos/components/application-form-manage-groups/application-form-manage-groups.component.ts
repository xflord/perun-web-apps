import { Component, OnInit, ViewChild } from '@angular/core';
import { Group, RegistrarManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_APPLICATION_FORM_ITEM_MANAGE_GROUP } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { AddGroupToRegistrationComponent } from '../../../shared/components/dialogs/add-group-to-registration/add-group-to-registration.component';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { GroupsListComponent } from '@perun-web-apps/perun/components';

@Component({
  selector: 'app-application-form-manage-groups',
  templateUrl: './application-form-manage-groups.component.html',
  styleUrls: ['./application-form-manage-groups.component.css'],
})
export class ApplicationFormManageGroupsComponent implements OnInit {
  @ViewChild('list', {})
  list: GroupsListComponent;

  loading: boolean;
  voId: number;
  groups: Group[] = [];
  selected = new SelectionModel<Group>(true, []);
  tableId = TABLE_APPLICATION_FORM_ITEM_MANAGE_GROUP;
  filterValue = '';
  addAuth: boolean;

  constructor(
    private registrarService: RegistrarManagerService,
    public authResolver: GuiAuthResolver,
    private dialog: MatDialog,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.parent.params.subscribe((params) => {
      this.voId = Number(params['voId']);
      this.loadGroups();
    });
  }

  loadGroups(): void {
    this.loading = true;
    this.registrarService.getGroupsToAutoRegistration(this.voId).subscribe(
      (groups) => {
        this.groups = groups;
        this.selected.clear();
        this.setAuthRights();
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  onAddGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '900px';
    config.data = {
      voId: this.voId,
      assignedGroups: this.groups.map((group) => group.id),
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(AddGroupToRegistrationComponent, config);

    dialogRef.afterClosed().subscribe((groupAssigned) => {
      if (groupAssigned) {
        this.loadGroups();
      }
    });
  }

  removeGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      items: this.selected.selected.map((group) => group.name),
      title: 'VO_DETAIL.SETTINGS.APPLICATION_FORM.MANAGE_GROUPS_PAGE.REMOVE_GROUP_DIALOG_TITLE',
      description:
        'VO_DETAIL.SETTINGS.APPLICATION_FORM.MANAGE_GROUPS_PAGE.REMOVE_GROUP_DIALOG_DESCRIPTION',
      theme: 'vo-theme',
      type: 'remove',
      showAsk: true,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.registrarService
          .deleteGroupsFromAutoRegistration(this.selected.selected.map((group) => group.id))
          .subscribe(() => {
            this.loadGroups();
          });
      }
    });
  }

  private setAuthRights(): void {
    const vo = { id: this.voId, beanName: 'Vo' };
    this.addAuth = this.authResolver.isAuthorized(
      'addGroupsToAutoRegistration_List<Group>_policy',
      [vo]
    );
  }
}
