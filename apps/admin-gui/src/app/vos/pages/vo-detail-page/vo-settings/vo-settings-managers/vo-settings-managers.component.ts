import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-settings-managers',
  templateUrl: './vo-settings-managers.component.html',
  styleUrls: ['./vo-settings-managers.component.scss'],
})
export class VoSettingsManagersComponent implements OnInit {
  @HostBinding('class.router-component') true;

  vo: Vo;

  availableRoles: string[] = [];

  type = 'Vo';

  theme = 'vo-theme';

  constructor(
    private dialog: MatDialog,
    private voService: VosManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.vo = this.entityStorageService.getEntity();
    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Vo');
  }
}
