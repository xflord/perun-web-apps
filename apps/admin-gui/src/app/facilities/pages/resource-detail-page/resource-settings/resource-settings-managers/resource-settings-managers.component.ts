import { Component, OnInit } from '@angular/core';
import { Resource } from '@perun-web-apps/perun/openapi';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-resource-settings-managers',
  templateUrl: './resource-settings-managers.component.html',
  styleUrls: ['./resource-settings-managers.component.scss'],
})
export class ResourceSettingsManagersComponent implements OnInit {
  resource: Resource;
  availableRoles: string[] = [];
  type = 'Resource';
  theme = 'resource-theme';

  constructor(
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.resource = this.entityStorageService.getEntity();
    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Resource');
  }
}
