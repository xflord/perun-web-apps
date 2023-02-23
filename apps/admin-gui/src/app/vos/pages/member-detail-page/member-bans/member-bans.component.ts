import { Component, OnInit } from '@angular/core';
import {
  EnrichedBanOnVo,
  Member,
  RichMember,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { BanOnEntityListColumn } from '@perun-web-apps/perun/components';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { UpdateVoBanDialogComponent } from '../../../../shared/components/dialogs/update-vo-ban-dialog/update-vo-ban-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-member-bans',
  templateUrl: './member-bans.component.html',
  styleUrls: ['./member-bans.component.scss'],
})
export class MemberBansComponent implements OnInit {
  loading = false;
  member: Member;
  bans: EnrichedBanOnVo[] = [];
  filter = '';
  displayedColumns: BanOnEntityListColumn[] = ['banId', 'description', 'expiration', 'edit'];

  constructor(
    private voService: VosManagerService,
    private entityService: EntityStorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.member = this.entityService.getEntity();
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.voService.getVoBanForMember(this.member.id).subscribe({
      next: (ban) => {
        if (ban) {
          this.bans = [
            {
              ban: ban,
              member: this.member as RichMember,
              vo: { id: this.member.voId, beanName: 'Vo' },
            },
          ];
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
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
