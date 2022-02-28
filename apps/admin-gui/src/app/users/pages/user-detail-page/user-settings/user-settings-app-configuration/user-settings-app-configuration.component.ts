import { Component, OnInit } from '@angular/core';
import { TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GUIConfigService, PREF_PAGE_SIZE } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-user-settings-app-configuration',
  templateUrl: './user-settings-app-configuration.component.html',
  styleUrls: ['./user-settings-app-configuration.component.scss'],
})
export class UserSettingsAppConfigurationComponent implements OnInit {
  tablePageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  preferredTablePageSize: number;

  constructor(private guiConfigService: GUIConfigService) {}

  ngOnInit(): void {
    this.preferredTablePageSize = this.guiConfigService.getNumber(PREF_PAGE_SIZE);
  }

  updatePreferredTablePageSize(): void {
    this.guiConfigService.setNumber(PREF_PAGE_SIZE, this.preferredTablePageSize);
  }
}
