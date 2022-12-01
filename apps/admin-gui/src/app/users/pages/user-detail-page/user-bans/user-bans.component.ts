import { Component, OnInit } from '@angular/core';
import {
  EnrichedBanOnFacility,
  EnrichedBanOnResource,
  EnrichedBanOnVo,
  FacilitiesManagerService,
  ResourcesManagerService,
  User,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { BanOnEntityListColumn, EnrichedBan } from '@perun-web-apps/perun/components';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UpdateVoBanDialogComponent } from '../../../../shared/components/dialogs/update-vo-ban-dialog/update-vo-ban-dialog.component';
import { UpdateResourceBanDialogComponent } from '../../../../shared/components/dialogs/update-resource-ban-dialog/update-resource-ban-dialog.component';
import { UpdateFacilityBanDialogComponent } from '../../../../shared/components/dialogs/update-facility-ban-dialog/update-facility-ban-dialog.component';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-user-bans',
  templateUrl: './user-bans.component.html',
  styleUrls: ['./user-bans.component.scss'],
})
export class UserBansComponent implements OnInit {
  loading = false;
  user: User;
  voBans: EnrichedBanOnVo[] = [];
  resourceBans: EnrichedBanOnResource[] = [];
  facilityBans: EnrichedBanOnFacility[] = [];
  filter = '';
  displayedColumns: BanOnEntityListColumn[] = [
    'banId',
    'targetId',
    'targetName',
    'description',
    'expiration',
    'edit',
  ];

  constructor(
    private voService: VosManagerService,
    private resourceService: ResourcesManagerService,
    private facilityService: FacilitiesManagerService,
    private entityService: EntityStorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.user = this.entityService.getEntity();
    this.refreshVoBans();
  }

  refreshVoBans(): void {
    this.loading = true;
    this.voService.getEnrichedVoBansForUser(this.user.id).subscribe({
      next: (bans) => {
        this.voBans = bans;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  refreshResourceBans(): void {
    this.loading = true;
    this.resourceService.getEnrichedBansForUser(this.user.id).subscribe({
      next: (bans) => {
        this.resourceBans = bans;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  refreshFacilityBans(): void {
    this.loading = true;
    this.facilityService.getEnricheFacilitydBansForUser(this.user.id).subscribe({
      next: (bans) => {
        this.facilityBans = bans;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  updateVoBan(ban: EnrichedBanOnVo): void {
    const dialogRef = this.dialog.open(UpdateVoBanDialogComponent, this.getConfig(ban));
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.refreshVoBans();
    });
  }

  updateResourceBan(ban: EnrichedBanOnResource): void {
    const dialogRef = this.dialog.open(UpdateResourceBanDialogComponent, this.getConfig(ban));
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.refreshResourceBans();
    });
  }

  updateFacilityBan(ban: EnrichedBanOnFacility): void {
    const dialogRef = this.dialog.open(UpdateFacilityBanDialogComponent, this.getConfig(ban));
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.refreshFacilityBans();
    });
  }

  getConfig(ban: EnrichedBan): MatDialogConfig {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      ban: ban.ban,
      theme: 'user-theme',
    };
    return config;
  }

  refresh(change: MatTabChangeEvent): void {
    if (change.index === 0) {
      this.refreshVoBans();
    } else if (change.index === 1) {
      this.refreshResourceBans();
    } else {
      this.refreshFacilityBans();
    }
  }
}
