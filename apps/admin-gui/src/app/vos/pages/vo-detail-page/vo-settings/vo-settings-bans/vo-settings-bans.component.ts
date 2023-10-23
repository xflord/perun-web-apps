import { Component, OnInit } from '@angular/core';
import { EnrichedBanOnVo, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddVoBanDialogComponent } from '../../../../../shared/components/dialogs/add-vo-ban-dialog/add-vo-ban-dialog.component';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { UpdateVoBanDialogComponent } from '../../../../../shared/components/dialogs/update-vo-ban-dialog/update-vo-ban-dialog.component';
import { BanOnEntityListColumn } from '@perun-web-apps/perun/components';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'app-vo-settings-bans',
  templateUrl: './vo-settings-bans.component.html',
  styleUrls: ['./vo-settings-bans.component.scss'],
  providers: [UserFullNamePipe],
})
export class VoSettingsBansComponent implements OnInit {
  loading = false;
  vo: Vo;
  bans: EnrichedBanOnVo[] = [];
  addAuth: boolean;
  removeAuth = false;
  filter = '';
  selection = new SelectionModel<EnrichedBanOnVo>(false, []);
  displayedColumns: BanOnEntityListColumn[] = [
    'select',
    'banId',
    'subjectId',
    'subjectName',
    'description',
    'expiration',
    'edit',
  ];

  constructor(
    private voService: VosManagerService,
    private entityService: EntityStorageService,
    private authResolver: GuiAuthResolver,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private userName: UserFullNamePipe,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityService.getEntity();
    this.addAuth = this.authResolver.isAuthorized('setBan_BanOnVo_policy', [this.vo]);
    this.removeAuth = this.authResolver.isAuthorized('vo-removeBan_int_policy', [this.vo]);
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.voService.getEnrichedBansForVo(this.vo.id).subscribe({
      next: (bans) => {
        this.bans = bans;
        this.selection.clear();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    const config = getDefaultDialogConfig();
    config.width = '850px';
    config.data = {
      entityId: this.vo.id,
      theme: 'vo-theme',
      bans: this.bans.map((ban) => ban.ban),
    };

    const dialogRef = this.dialog.open(AddVoBanDialogComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.refresh();
    });
  }

  remove(): void {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      theme: 'vo-theme',
      title: 'DIALOGS.REMOVE_BAN.TITLE',
      description: 'DIALOGS.REMOVE_BAN.DESCRIPTION',
      items: [this.userName.transform(this.selection.selected[0].member.user)],
      type: 'remove',
      showAsk: true,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.voService.removeVoBan(this.selection.selected[0].ban.id).subscribe(() => {
          this.notificator.showSuccess('DIALOGS.REMOVE_BAN.SUCCESS');
          this.refresh();
        });
      }
    });
  }

  update(ban: EnrichedBanOnVo): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      ban: ban.ban,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(UpdateVoBanDialogComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.refresh();
    });
  }
}
