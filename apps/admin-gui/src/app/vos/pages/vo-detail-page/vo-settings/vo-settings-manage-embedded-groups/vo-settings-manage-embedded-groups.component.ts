import { Component, OnInit } from '@angular/core';
import { Group, RegistrarManagerService, Type, Vo } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddGroupToVoRegistrationComponent } from '../../../../../shared/components/dialogs/add-group-to-vo-registration/add-group-to-vo-registration.component';

@Component({
  selector: 'app-vo-settings-manage-embedded-groups',
  templateUrl: './vo-settings-manage-embedded-groups.component.html',
  styleUrls: ['./vo-settings-manage-embedded-groups.component.scss'],
})
export class VoSettingsManageEmbeddedGroupsComponent implements OnInit {
  loading: boolean;
  vo: Vo;
  groups: Group[] = [];
  selected = new SelectionModel<Group>(true, []);
  embeddedFormItemId: number;
  addAuth: boolean;
  removeAuth$: Observable<boolean> = this.selected.changed.pipe(
    map((change) => {
      return change.source.selected.reduce(
        (acc, grp) =>
          acc &&
          this.authResolver.isAuthorized(
            'deleteGroupsFromAutoRegistration_List<Group>_ApplicationFormItem_policy',
            [grp],
          ),
        true,
      );
    }),
    startWith(true),
  );

  constructor(
    private registrarService: RegistrarManagerService,
    public authResolver: GuiAuthResolver,
    private dialog: MatDialog,
    protected route: ActivatedRoute,
    private entityStorageService: EntityStorageService,
    private registrarManager: RegistrarManagerService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.registrarManager.getFormItemsForVo(this.vo.id).subscribe({
      next: (formItems) => {
        this.embeddedFormItemId = formItems.filter(
          (item) => item.type === Type.EMBEDDED_GROUP_APPLICATION,
        )[0].id;
        this.loadGroups();
      },
      error: () => (this.loading = false),
    });
  }

  loadGroups(): void {
    this.loading = true;
    this.registrarService
      .getVoGroupsToAutoRegistration(this.vo.id, this.embeddedFormItemId)
      .subscribe({
        next: (groups) => {
          this.groups = groups;
          // FIXME: should be there vo or some potentially added group?
          this.addAuth = this.authResolver.isAuthorized(
            'addGroupsToAutoRegistration_List<Group>_ApplicationFormItem_policy',
            [this.vo],
          );
          this.selected.clear();
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onAddGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '900px';
    config.data = {
      voId: this.vo.id,
      assignedGroups: this.groups.map((group) => group.id),
      embeddedFormItemId: this.embeddedFormItemId,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(AddGroupToVoRegistrationComponent, config);

    dialogRef.afterClosed().subscribe((groupAssigned) => {
      if (groupAssigned) {
        this.loadGroups();
      }
    });
  }

  removeGroup(): void {
    this.loading = true;
    this.registrarService
      .deleteVoGroupsFromAutoRegistration(
        this.selected.selected.map((group) => group.id),
        this.embeddedFormItemId,
      )
      .subscribe({
        next: () => {
          this.loadGroups();
        },
        error: () => (this.loading = false),
      });
  }
}
