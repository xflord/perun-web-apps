import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Group, GroupsManagerService, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import {
  EntityStorageService,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddGroupHierarchicalIncludeDialogComponent } from '../../../../../shared/components/dialogs/add-group-hierarchical-include-dialog/add-group-hierarchical-include-dialog.component';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { TABLE_HIERARCHICAL_INCLUSION } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-vo-settings-hierarchical-inclusion',
  templateUrl: './vo-settings-hierarchical-inclusion.component.html',
  styleUrls: ['./vo-settings-hierarchical-inclusion.component.scss'],
})
export class VoSettingsHierarchicalInclusionComponent implements OnInit {
  loading = false;
  vo: Vo;
  parentVos: Vo[] = [];
  selectedParentVo: Vo;
  allowedGroups: Group[] = [];
  selected = new SelectionModel<Group>(true, []);
  tableId = TABLE_HIERARCHICAL_INCLUSION;

  constructor(
    private dialog: MatDialog,
    private entityStorage: EntityStorageService,
    private voService: VosManagerService,
    private groupService: GroupsManagerService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorage.getEntity();
    this.voService.getEnrichedVoById(this.vo.id).subscribe(
      (enrichedVo) => {
        this.parentVos = enrichedVo.parentVos;
        this.loading = false;
      },
      () => (this.loading = false),
    );
  }

  voSelected(vo: Vo): void {
    this.selectedParentVo = vo;
    this.loadAllowedGroups();
    this.changeDetector.detectChanges();
  }

  loadAllowedGroups(): void {
    this.loading = true;
    this.selected.clear();
    this.groupService
      .getVoAllAllowedGroupsToHierarchicalVo(this.selectedParentVo.id, this.vo.id)
      .subscribe((groups) => {
        this.allowedGroups = groups;
        this.loading = false;
      });
  }

  addGroupsInclusion(): void {
    const config = getDefaultDialogConfig();
    config.width = '750px';
    config.data = {
      theme: 'vo-theme',
      voId: this.vo.id,
      parentVo: this.selectedParentVo,
      allowedGroupsIds: this.allowedGroups.map((group) => group.id),
    };

    this.dialog
      .open(AddGroupHierarchicalIncludeDialogComponent, config)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loadAllowedGroups();
        }
      });
  }

  removeGroupsInclusion(): void {
    const config = getDefaultDialogConfig();
    config.width = '750px';
    config.data = {
      theme: 'vo-theme',
      title: 'DIALOGS.REMOVE_GROUPS_HIERARCHICAL_INCLUSION.TITLE',
      description: 'DIALOGS.REMOVE_GROUPS_HIERARCHICAL_INCLUSION.DESCRIPTION',
      items: this.selected.selected.map((group) => group.name),
      alert: this.translate.instant('DIALOGS.REMOVE_GROUPS_HIERARCHICAL_INCLUSION.ALERT', {
        parentVo: this.selectedParentVo.name,
      }),
      type: 'remove',
      showAsk: true,
    };

    this.dialog
      .open(UniversalConfirmationItemsDialogComponent, config)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.disallowGroups();
        }
      });
  }

  disallowGroups(): void {
    this.loading = true;
    const groupIds = this.selected.selected.map((group) => group.id);
    this.groupService.disallowGroupsToHierarchicalVo(groupIds, this.selectedParentVo.id).subscribe({
      next: () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.REMOVE_GROUPS_HIERARCHICAL_INCLUSION.SUCCESS'),
        );
        this.loadAllowedGroups();
      },
      error: () => (this.loading = false),
    });
  }
}
