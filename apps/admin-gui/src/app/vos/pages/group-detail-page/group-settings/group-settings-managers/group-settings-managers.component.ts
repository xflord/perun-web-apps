import { Component, HostBinding, OnInit } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-group-settings-managers',
  templateUrl: './group-settings-managers.component.html',
  styleUrls: ['./group-settings-managers.component.scss'],
})
export class GroupSettingsManagersComponent implements OnInit {
  @HostBinding('class.router-component') true;
  group: Group;
  availableRoles: string[] = [];
  selected = 'user';
  type = 'Group';
  theme = 'group-theme';

  constructor(
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.group = this.entityStorageService.getEntity();
    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Group');
  }
}
