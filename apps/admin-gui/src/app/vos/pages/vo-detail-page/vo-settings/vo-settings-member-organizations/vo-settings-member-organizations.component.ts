import { Component, OnInit } from '@angular/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberOrganizationDialogComponent } from './add-member-organization-dialog/add-member-organization-dialog.component';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { ReloadEntityDetailService } from '../../../../../core/services/common/reload-entity-detail.service';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vo-settings-member-organizations',
  templateUrl: './vo-settings-member-organizations.component.html',
  styleUrls: ['./vo-settings-member-organizations.component.scss'],
})
export class VoSettingsMemberOrganizationsComponent implements OnInit {
  loading = false;
  voId: number;
  voSelection: SelectionModel<Vo> = new SelectionModel<Vo>(false, []);
  displayedColumns = ['checkbox', 'id', 'shortName', 'name'];
  filterValue = '';
  auth = false;
  memberVos: Vo[] = [];

  constructor(
    private dialog: MatDialog,
    private vosService: VosManagerService,
    private entityStorage: EntityStorageService,
    private authResolver: GuiAuthResolver,
    private reloadDetailService: ReloadEntityDetailService,
    private notificator: NotificatorService,
    private translator: TranslateService
  ) {}

  ngOnInit(): void {
    this.auth = this.authResolver.isPerunAdmin();
    this.voId = this.entityStorage.getEntity().id;
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.vosService.getEnrichedVoById(this.voId).subscribe(
      (enrichedVo) => {
        this.voId = enrichedVo.vo.id;
        this.memberVos = enrichedVo.memberVos;
        this.voSelection.clear();
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  addMemberOrganization(): void {
    const config = getDefaultDialogConfig();
    config.width = '750px';

    this.dialog
      .open(AddMemberOrganizationDialogComponent, config)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.reloadDetailService.reloadEntityDetail();
          this.refresh();
        }
      });
  }

  removeMemberVos() {
    this.vosService.removeMemberVo(this.voId, this.voSelection.selected[0].id).subscribe(() => {
      this.notificator.showSuccess(
        this.translator.instant(
          'VO_DETAIL.SETTINGS.MEMBER_ORGANIZATIONS.REMOVE_MEMBER_ORGANIZATION.TITLE'
        ) as string
      );
      this.reloadDetailService.reloadEntityDetail();
      this.refresh();
    });
  }

  removeMemberOrganization() {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      items: this.voSelection.selected.map((vo) => vo.name),
      title: 'VO_DETAIL.SETTINGS.MEMBER_ORGANIZATIONS.REMOVE_MEMBER_ORGANIZATION.TITLE',
      alert: 'VO_DETAIL.SETTINGS.MEMBER_ORGANIZATIONS.REMOVE_MEMBER_ORGANIZATION.WARNING',
      theme: 'vo-theme',
      type: 'remove',
      showAsk: true,
    };

    this.dialog
      .open(UniversalConfirmationItemsDialogComponent, config)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.removeMemberVos();
        }
      });
  }
}
